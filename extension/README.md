# Tecbunny Product Extractor Extension

Latest status update: 2026-07-19. The extension is included in the enterprise platform review as the Chrome Extension surface. Existing API coverage includes extension authentication and scraper/product import endpoints; production gaps are extension job history, extraction review queue, token revoke/rotation, source allowlist governance, and extension telemetry as archived in `ALL_MARKDOWN_DOCUMENTS.md`.

## Production Requirements

- Configure `CHROME_EXTENSION_ID` after Chrome Web Store registration so API CORS allows `chrome-extension://<id>`.
- Use `CHROME_EXTENSION_ALLOWED_ORIGINS` for additional comma-separated extension origins during controlled testing.
- Keep `host_permissions` limited to `https://www.tecbunny.com/*`; user-initiated page scraping uses `activeTab` and `scripting`.
- Extension tokens are stored in `chrome.storage.session`; local storage is limited to non-secret account display state.
- Scraped products are created with `status: draft` and must be reviewed before publication.

## Validation

Run from the repository root:

```powershell
node --check extension/background.js; node --check extension/content.js; node --check extension/popup.js; node --check extension/options.js
npx tsc --noEmit --pretty false -p apps/api/tsconfig.json
npx tsc --noEmit --pretty false -p packages/core/tsconfig.json
```