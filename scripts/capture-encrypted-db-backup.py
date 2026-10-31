"""Read-only logical export, encrypted before it touches disk.

Run on the VPS with an owner-generated public recipient certificate. Never copy the
decryption key to the VPS. This is capture evidence, not a completed restore drill.
"""
import argparse
import datetime
import hashlib
import json
import os
import re
import shutil
import subprocess
import tempfile
import time
import urllib.parse
import uuid
from pathlib import Path


def inspect(kind, name):
    return json.loads(subprocess.check_output(["docker", kind, "inspect", name], timeout=15))[0]


def available_memory():
    for line in Path("/proc/meminfo").read_text().splitlines():
        if line.startswith("MemAvailable:"):
            return int(line.split()[1]) * 1024
    raise RuntimeError("Missing host memory observation")


def run(args):
    os.umask(0o077)
    base = Path(args.output_directory).resolve(strict=True)
    assert base.is_relative_to(Path("/var/backups/tecbunny"))
    recipient = Path(args.recipient).resolve(strict=True)
    assert recipient.is_file()
    assert shutil.disk_usage(base).free > 768 * 1024 * 1024, "Insufficient disk headroom"
    # 128 MiB client cap + 32 MiB streaming-controller budget + 64 MiB host reserve.
    assert available_memory() > 224 * 1024 * 1024, "Insufficient memory headroom"
    container = inspect("container", "tecbunny-api")
    assert container["Image"] == args.expected_api_image, "Live API changed; recheck source identity"
    image = inspect("image", args.postgres_image)
    assert image["Architecture"] == "amd64" and image["Os"] == "linux"
    assert any(name.startswith("postgres@sha256:") for name in image.get("RepoDigests", [])), "Unrecognized client image provenance"
    env = dict(value.split("=", 1) for value in container["Config"]["Env"])
    source = urllib.parse.urlparse(env["DATABASE_URL"])
    assert source.hostname.endswith(".pooler.supabase.com")
    assert "yzrznydkqcacjiwalmlw" in urllib.parse.unquote(source.username)
    settings = {
        "PGHOST": source.hostname, "PGPORT": str(source.port or 5432),
        "PGUSER": urllib.parse.unquote(source.username), "PGPASSWORD": urllib.parse.unquote(source.password),
        "PGDATABASE": source.path.lstrip("/"), "PGSSLMODE": "verify-full",
        "PGSSLROOTCERT": "/run/certs/supabase-ca.crt", "PGCONNECT_TIMEOUT": "10",
        "PGOPTIONS": "-c default_transaction_read_only=on -c statement_timeout=180000 -c lock_timeout=5000",
    }
    assert all("\n" not in value and "\r" not in value for value in settings.values())
    certificate = Path("/opt/tecbunny/certs/supabase-ca.crt").resolve(strict=True)
    timestamp = datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    identifier = f"{timestamp}-{uuid.uuid4().hex[:8]}"
    name = f"tecbunny-readonly-backup-{identifier.lower()}"
    partial = base / f"database-{identifier}.cms.partial"
    destination = partial.with_suffix("")
    log = base / f"private-{identifier}.log"
    descriptor, credentials = tempfile.mkstemp(prefix=".pg-client-", dir=base)
    with os.fdopen(descriptor, "w") as stream:
        stream.write("".join(f"{key}={value}\n" for key, value in settings.items()))
    command = ["docker", "run", "--rm", "--name", name, "--label", "com.tecbunny.purpose=readonly-encrypted-backup",
               "--network", "bridge", "--memory", "128m", "--memory-swap", "192m", "--cpus", "0.25",
               "--env-file", credentials, "--mount", f"type=bind,src={certificate},dst=/run/certs/supabase-ca.crt,readonly",
               args.postgres_image, "pg_dump", "--format=custom", "--compress=1", "--no-owner", "--no-password",
               "--lock-wait-timeout=5s", "--schema=public", "--schema=private", "--schema=auth", "--schema=storage"]
    dump = encryption = None
    start = time.monotonic()
    try:
        with log.open("xb") as errors, partial.open("xb") as encrypted:
            dump = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=errors, stdin=subprocess.DEVNULL)
            encryption = subprocess.Popen(["openssl", "cms", "-encrypt", "-stream", "-aes-256-gcm", "-binary", "-outform", "DER",
                                           "-recip", str(recipient), "-keyopt", "rsa_padding_mode:oaep", "-keyopt", "rsa_oaep_md:sha256"],
                                          stdin=dump.stdout, stdout=encrypted, stderr=errors)
            dump.stdout.close()
            last_progress = -30
            while dump.poll() is None:
                elapsed = time.monotonic() - start
                memory, disk, size = available_memory(), shutil.disk_usage(base).free, partial.stat().st_size
                reason = ("600-second deadline" if elapsed > 600 else "64-MiB host reserve" if memory < 64 * 1024 * 1024
                          else "512-MiB disk reserve" if disk < 512 * 1024 * 1024 else "256-MiB export budget" if size > 256 * 1024 * 1024 else None)
                if reason:
                    raise RuntimeError(f"Backup stopped at {reason}")
                if elapsed - last_progress >= 30:
                    print(json.dumps({"status": "capturing", "elapsedSeconds": round(elapsed), "encryptedBytes": size,
                                      "availableMemoryMiB": memory // 1048576, "freeDiskMiB": disk // 1048576}), flush=True)
                    last_progress = elapsed
                time.sleep(2)
            assert dump.returncode == 0, "Export failed; inspect the private log without publishing its contents"
            assert encryption.wait(timeout=20) == 0, "Authenticated encryption failed"
        partial.rename(destination)
        with destination.open("rb") as stream:
            encrypted_hash = hashlib.file_digest(stream, "sha256").hexdigest()
        receipt = {
            "recordedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(), "status": "captured-not-restored",
            "startedAt": timestamp, "durationSeconds": round(time.monotonic() - start, 2),
            "sourceProjectRef": "yzrznydkqcacjiwalmlw", "sourceApiImage": container["Image"],
            "postgresClientImage": image["Id"], "postgresClientRegistryDigests": image["RepoDigests"],
            "schemas": ["public", "private (if present)", "auth", "storage metadata"],
            "encryptedFile": destination.name, "encryptedBytes": destination.stat().st_size,
            "encryptedSha256": encrypted_hash,
            "recipientCertificateSha256": hashlib.sha256(recipient.read_bytes()).hexdigest(),
            "encryption": "OpenSSL CMS AES-256-GCM; RSA-OAEP/SHA-256 recipient transport; streaming",
            "readOnlySource": True, "tlsVerification": "verify-full with provider CA", "plaintextWrittenToDisk": False,
            "limitations": ["Restore has not been executed", "Storage object bytes and provider/project configuration are not in this logical export",
                            "No daily schedule/retention or sustained RPO guarantee established by one capture"],
        }
        (base / f"receipt-{identifier}.json").write_text(json.dumps(receipt, indent=2) + "\n")
        print(json.dumps(receipt))
    finally:
        try:
            if dump and dump.poll() is None:
                try:
                    owned = inspect("container", name)
                except (subprocess.CalledProcessError, IndexError):
                    owned = None
                if owned:
                    assert owned["Config"]["Labels"].get("com.tecbunny.purpose") == "readonly-encrypted-backup"
                    subprocess.run(["docker", "rm", "-f", name], capture_output=True, timeout=15, check=False)
                dump.terminate()
                dump.wait(timeout=15)
            if encryption and encryption.poll() is None:
                encryption.terminate()
                encryption.wait(timeout=10)
        finally:
            Path(credentials).unlink(missing_ok=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--recipient", required=True)
    parser.add_argument("--output-directory", required=True)
    parser.add_argument("--postgres-image", required=True)
    parser.add_argument("--expected-api-image", required=True)
    arguments = parser.parse_args()
    assert all(re.fullmatch(r"sha256:[a-f0-9]{64}", value) for value in [arguments.postgres_image, arguments.expected_api_image])
    try:
        run(arguments)
    except Exception as error:
        print(json.dumps({"status": "backup-failed", "detail": str(error) if isinstance(error, (AssertionError, RuntimeError)) else type(error).__name__}))
        raise SystemExit(1)
