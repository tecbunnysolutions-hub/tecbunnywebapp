import importlib.util
import json
import socketserver
import tempfile
import threading
import unittest
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

spec = importlib.util.spec_from_file_location("monitor", Path(__file__).with_name("ops-health-monitor.py"))
monitor = importlib.util.module_from_spec(spec)
spec.loader.exec_module(monitor)


class MonitorTests(unittest.TestCase):
    def test_threshold_cooldown_and_recovery(self):
        accepted = []
        sender = lambda config, incident, kind: accepted.append((incident, kind))
        state = {}
        for index in range(3):
            state, result = monitor.observe({}, state, False, now=1000 + index, sender=sender)
        self.assertEqual(result["notification"], "smtp-accepted-alert")
        incident = state["incident"]
        state, result = monitor.observe({}, state, False, now=1100, sender=sender)
        self.assertEqual(result["notification"], "none")
        state, _ = monitor.observe({}, state, True, now=1200, sender=sender)
        state, result = monitor.observe({}, state, True, now=1201, sender=sender)
        self.assertEqual(result["notification"], "smtp-accepted-recovery")
        self.assertEqual(accepted, [(incident, "unhealthy"), (incident, "recovered")])
        self.assertIsNone(state["incident"])

    def test_failed_mail_is_not_recorded_as_accepted_and_retries(self):
        def rejected(*args):
            raise RuntimeError("fixture failure; must not enter logs")
        state = {}
        for index in range(3):
            state, result = monitor.observe({}, state, False, now=1000 + index, sender=rejected)
        self.assertEqual(result["notification"], "send-failed")
        self.assertIsNone(state["lastAcceptedAt"])
        state, result = monitor.observe({}, state, False, now=1060, sender=lambda *args: None)
        self.assertEqual(result["notification"], "smtp-accepted-alert")

    def test_real_smtp_acceptance_into_local_sink(self):
        received = []

        class Sink(socketserver.StreamRequestHandler):
            def handle(self):
                self.wfile.write(b"220 fixture SMTP\r\n")
                while True:
                    line = self.rfile.readline()
                    if not line:
                        return
                    command = line.split(b" ", 1)[0].strip().upper()
                    if command == b"DATA":
                        self.wfile.write(b"354 Send data\r\n")
                        data = b""
                        while True:
                            part = self.rfile.readline()
                            if part == b".\r\n" or not part:
                                break
                            data += part
                        received.append(data)
                        self.wfile.write(b"250 Captured locally\r\n")
                    elif command == b"QUIT":
                        self.wfile.write(b"221 Bye\r\n")
                        return
                    else:
                        self.wfile.write(b"250 OK\r\n")

        with socketserver.ThreadingTCPServer(("127.0.0.1", 0), Sink) as server:
            thread = threading.Thread(target=server.serve_forever, daemon=True)
            thread.start()
            try:
                config = {"sender": "monitor@example.test", "recipient": "owner@example.test", "label": "local-drill",
                          "smtp": {"host": "127.0.0.1", "port": server.server_address[1], "localSink": True}}
                monitor.send_notification(config, "fixture-only-incident", "unhealthy")
                self.assertEqual(len(received), 1)
                self.assertIn(b"fixture-only-incident", received[0])
                self.assertIn(b"owner@example.test", received[0])
            finally:
                server.shutdown()
                thread.join()

    def test_health_protocol_and_no_redirects(self):
        class Handler(BaseHTTPRequestHandler):
            def do_GET(self):
                if self.path == "/redirect":
                    self.send_response(302)
                    self.send_header("Location", "https://api.tecbunny.com/api/health")
                    self.end_headers()
                    return
                self.send_response(200)
                self.end_headers()
                self.wfile.write(json.dumps({"status": "healthy" if self.path == "/healthy" else "degraded"}).encode())

            def log_message(self, *args):
                pass

        with ThreadingHTTPServer(("127.0.0.1", 0), Handler) as server:
            thread = threading.Thread(target=server.serve_forever, daemon=True)
            thread.start()
            try:
                base = f"http://127.0.0.1:{server.server_address[1]}"
                self.assertTrue(monitor.probe(base + "/healthy"))
                self.assertFalse(monitor.probe(base + "/degraded"))
                self.assertFalse(monitor.probe(base + "/redirect"))
                with self.assertRaises(ValueError):
                    monitor.probe("http://external.example.test/health")
            finally:
                server.shutdown()
                thread.join()

    def test_external_sink_bypass_and_unapproved_multi_recipient_are_rejected(self):
        config = {"sender": "monitor@example.test", "recipient": "owner@example.test",
                  "smtp": {"host": "external.example.test", "port": 25, "localSink": True}}
        with self.assertRaises(ValueError):
            monitor.send_notification(config, "fixture", "unhealthy")
        config["smtp"]["host"] = "127.0.0.1"
        config["recipient"] = "one@example.test,two@example.test"
        with self.assertRaises(ValueError):
            monitor.send_notification(config, "fixture", "unhealthy")

    def test_state_is_atomic_and_round_trips(self):
        with tempfile.TemporaryDirectory(prefix="tecbunny-monitor-test-") as directory:
            target = Path(directory) / "state.json"
            state = {"failures": 3, "incident": "fixture"}
            monitor.save_state(target, state)
            self.assertEqual(json.loads(target.read_text()), state)
            self.assertEqual([item.name for item in Path(directory).iterdir()], ["state.json"])


if __name__ == "__main__":
    unittest.main()
