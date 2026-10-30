# Temporary verified-backport audit policy — proposal

**Status: unapproved; the audit gate still fails.** The registry scan on 30 October
reported one high finding, GHSA-mrhx-c7xc-m3w5, for declared Zod 4.6.5. The exact
maintainer fix is installed and passes the pinned source/ESM/CommonJS hashes and
bounded-parser regressions. The package version and raw finding remain unchanged.

The proposed policy admits only this advisory, exact package version and upstream
commit `a0ebf970f2d752e5f58527cd2942ff48be4f46bd`, after checking every affected
installed copy and both module formats. Any other high/critical finding, changed
advisory, missing/modified bytes, invalid audit response or failed regression blocks
the release. The proposal expires **13 November 2026 at 00:00 UTC**. Adoption of an
official fixed package requires review and removal/revalidation of the backport.

The proposed accountable owner is the TecBunny release account
`tecbunnysolutions-hub`. Approval must explicitly accept these technical conditions
and expiry; it is not inferred from a generic instruction to fix the application.
Record approval evidence and timestamp in `quality/dependency-audit-policy.json`
before changing either local or CI admission. No deployment is authorized by this
policy, and all other release gates still apply.

Verification performed:

- `node --test scripts/test-dependency-audit-policy.mjs`: **5 tests passed**,
  including new advisory/indirect finding rejection, malformed/inconsistent audit
  rejection, expiry/future approval and tampering of every pinned source/runtime file.
- `node scripts/audit-dependencies.mjs`: **failed as intended**, solely because
  policy approval is absent. Raw audit: **one high**, zero other severities. One
  installed copy passed source/runtime hashes and both-format regressions.
- Full raw result and verification are retained privately at
  `scratch/dependency-audit/report.json`; there is no blind audit ignore list.

These checks evaluate the proposal. They do not claim the raw audit passes or that
the installed code was independently audited beyond the pinned upstream mitigation.
