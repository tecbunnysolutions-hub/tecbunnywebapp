"""Proposed persistent job entry point; installing a timer is a separate step."""
import json
import signal
import subprocess
import sys
from pathlib import Path

BASE = Path('/var/backups/tecbunny/readiness-20261030')
CLIENT = 'sha256:266d3c257594e195b309ae9d1805e54c788f1d7b375f56bf6c367aac6c917e7b'


def main():
    current = json.loads(subprocess.check_output(['docker', 'inspect', 'tecbunny-api'], timeout=15))[0]
    # The exporter rechecks this exact image and the expected database project.
    command = [sys.executable, str(BASE / 'capture-encrypted-db-backup.py'),
               '--recipient', str(BASE / 'recipient.pem'), '--output-directory', str(BASE),
               '--postgres-image', CLIENT, '--expected-api-image', current['Image']]
    process = subprocess.Popen(command)
    try:
        return process.wait(timeout=650)
    except subprocess.TimeoutExpired:
        process.send_signal(signal.SIGTERM)
        try:
            return process.wait(timeout=60)
        except subprocess.TimeoutExpired:
            process.kill()
            return process.wait(timeout=15)


if __name__ == '__main__':
    raise SystemExit(main())
