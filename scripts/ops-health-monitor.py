"""Host-side health monitor. No dependency on the API process/container runtime.

Configuration and state stay outside Git with owner-only permissions. Installing
the schedule and selecting a real recipient are separate operational steps.
"""
import argparse
import json
import os
import smtplib
import ssl
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
from email.message import EmailMessage
from pathlib import Path


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def probe(url, timeout=8):
    target = urllib.parse.urlparse(url)
    if target.scheme != "https" and not (target.scheme == "http" and target.hostname == "127.0.0.1"):
        raise ValueError("Health target must use verified HTTPS or a loopback fixture")
    if target.username or target.password or target.query or target.fragment:
        raise ValueError("Health URLs must not contain credentials or query parameters")
    opener = urllib.request.build_opener(NoRedirect(), urllib.request.HTTPSHandler(context=ssl.create_default_context()))
    try:
        with opener.open(url, timeout=timeout) as response:
            body = response.read(65537)
            if len(body) > 65536:
                return False
            payload = json.loads(body)
            return response.status == 200 and payload.get("status") == "healthy"
    except urllib.error.HTTPError as error:
        error.close()
        return False
    except (OSError, urllib.error.URLError, ValueError):
        return False


def send_notification(config, incident, kind):
    smtp = config["smtp"]
    sink = smtp.get("localSink", False)
    if sink and smtp["host"] != "127.0.0.1":
        raise ValueError("An unencrypted sink must be loopback-only")
    if not sink and (not smtp.get("username") or not smtp.get("password")):
        raise ValueError("External mail requires authenticated verified TLS")
    recipient = config["recipient"]
    if not recipient or any(character in recipient for character in "\r\n,"):
        raise ValueError("Configure one explicit approved recipient")
    message = EmailMessage()
    message["From"] = config["sender"]
    message["To"] = recipient
    message["Subject"] = f"[TecBunny {config.get('label', 'ops')}] {kind} {incident}"
    message["Message-ID"] = f"<{incident}.{kind}@monitor.tecbunny.com>"
    message.set_content(f"Test/incident ID: {incident}\nStatus: {kind}\nNo customer data is included.\n")
    context = ssl.create_default_context()
    if smtp.get("secure", False):
        transport = smtplib.SMTP_SSL(smtp["host"], int(smtp["port"]), timeout=10, context=context)
    else:
        transport = smtplib.SMTP(smtp["host"], int(smtp["port"]), timeout=10)
    with transport:
        transport.ehlo()
        if not sink and not smtp.get("secure", False):
            transport.starttls(context=context)
            transport.ehlo()
        if not sink:
            transport.login(smtp["username"], smtp["password"])
        refused = transport.send_message(message)
        if refused:
            raise RuntimeError("SMTP did not accept the configured recipient")


def observe(config, state, healthy, now=None, sender=send_notification):
    now = time.time() if now is None else now
    state = dict(state)
    state.setdefault("failures", 0)
    state.setdefault("successes", 0)
    state.setdefault("lastAcceptedAt", None)
    state.setdefault("incident", None)
    notification = "none"
    if healthy:
        state["failures"] = 0
        state["successes"] += 1
        if state["incident"] and state["lastAcceptedAt"] is not None and state["successes"] >= 2:
            try:
                sender(config, state["incident"], "recovered")
                notification = "smtp-accepted-recovery"
                state["incident"] = None
                state["lastAcceptedAt"] = None
            except Exception:
                notification = "send-failed"
    else:
        state["successes"] = 0
        state["failures"] += 1
        due = state["lastAcceptedAt"] is None or now - state["lastAcceptedAt"] >= 900
        if state["failures"] >= 3 and due:
            state["incident"] = state["incident"] or str(uuid.uuid4())
            try:
                sender(config, state["incident"], "unhealthy")
                state["lastAcceptedAt"] = now
                notification = "smtp-accepted-alert"
            except Exception:
                notification = "send-failed"
    state["lastCheckedAt"] = now
    return state, {"healthy": healthy, "consecutiveFailures": state["failures"], "notification": notification}


def save_state(target, state):
    target = Path(target)
    target.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
    descriptor, temporary = tempfile.mkstemp(prefix=".monitor-", dir=target.parent)
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8") as stream:
            json.dump(state, stream)
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(temporary, target)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", required=True)
    parser.add_argument("--state", required=True)
    args = parser.parse_args()
    # Never log configuration, provider errors, health bodies or SMTP transcripts.
    try:
        config = json.loads(Path(args.config).read_text(encoding="utf-8"))
        target = Path(args.state)
        state = json.loads(target.read_text(encoding="utf-8")) if target.exists() else {}
        state, result = observe(config, state, probe(config["healthUrl"]))
        save_state(target, state)
        print(json.dumps(result))
        return 0 if result["healthy"] and result["notification"] != "send-failed" else 1
    except Exception:
        print(json.dumps({"status": "monitor-failed", "detail": "Inspect private configuration and local runtime; secrets are not logged"}))
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
