# Proposed recurring database capture

These files are **not installed or enabled**. They make the persistent production
change reviewable separately from the approved recovery rehearsal. The proposal
runs the verified, read-only encrypted exporter twice daily, at 00:00 and 12:00 UTC
(05:30 and 17:30 IST), with up to five minutes of jitter. It does not restart the
API, migrate data, publish an image, delete backups or send messages.

Local wrapper tests cover normal completion and graceful timeout escalation.
Linux systemd validation has not run: automatic approval review blocked the remote
validation/preparation command because approval was required but this session
cannot request it. Do not treat these source files as an executed production job.

The Docker client image is the immutable PostgreSQL 17.11 image used successfully
in the rehearsal. The live API image is observed afresh and rechecked by the
exporter; it is not replaced. Source-project, verified-TLS, read-only, memory, CPU,
disk, export-size and deadline guards remain active. Only the public encryption
recipient is present on the server; the private decryption key stays with the owner.

Before enabling this proposal, approve the persistent job, secure/escrow the
decryption key, agree retention and establish a working failure-alert channel.
No automatic deletion policy is included. The disk guard will refuse another
capture when capacity becomes insufficient; it is not a substitute for retention
or alerting. Storage-object recurrence and managed-service restore remain separate
work. Two authorized test emails do not authorize ongoing alerts.

After approval, copy both the reviewed exporter and wrapper into
`/var/backups/tecbunny/readiness-20261030/` with root-only permissions. Install the
reviewed service/timer under `/etc/systemd/system/`, validate them with
`systemd-analyze verify`, reload systemd, run and verify one service invocation,
then enable the timer. Record the next trigger and successful capture receipt.
Rollback disables/stops only this timer and service; it preserves all captures and
does not affect the API or database. Do not claim a sustained 24-hour RPO until
recurrence, retained recoverable copies and failure handling are observed.
