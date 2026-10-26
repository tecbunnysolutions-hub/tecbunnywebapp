# Google Merchant API

Configured account: `5887848614`. API product data source: `10787386542` (TEC1).
Language: English; feed label/country: IN; currency: INR.

## Google setup

Enable Merchant API in the service account's Google Cloud project. Add the service
account email as a user with product management access in Merchant Center.
Complete developer registration linking the Cloud project to Merchant Center:
https://developers.google.com/merchant/api/guides/quickstart/direct-api-calls

Registration completed for Cloud project number `587675288174`, with
`tecbunnysolutions@gmail.com` as the developer contact. TECB1 has Standard
Merchant Center access; temporary Admin access was removed after registration.
Google can take five minutes to propagate registration before accepting uploads.

Store the service account JSON outside the repository. Never commit this key.

## Run from the repository root (PowerShell)

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS = 'C:\secure\merchant-service-account.json'
node scripts/google-merchant-sync.mjs
node scripts/google-merchant-sync.mjs --apply
```

The first command previews eligibility without authenticating or uploading. The
second uploads current public catalogue products. Account/source defaults can be
overridden with GOOGLE_MERCHANT_ACCOUNT_ID and GOOGLE_MERCHANT_DATA_SOURCE_ID.

The command uses OAuth service account authentication and calls:

```text
POST https://merchantapi.googleapis.com/products/v1/accounts/5887848614/productInputs:insert?dataSource=accounts/5887848614/dataSources/10787386542
```

For a future project registration, the caller needs Merchant Center Admin access
and the developer contact must be a human Google account. The setup command is:

```powershell
$env:GOOGLE_MERCHANT_DEVELOPER_EMAIL = 'tecbunnysolutions@gmail.com'
node scripts/google-merchant-sync.mjs --register
```

Restore Standard access after registration. Uploads stop immediately on
authentication, permission or rate-limit errors rather than failing every item.

This is an outbound Google API integration, not a URL to paste into Merchant
Center. No API key is issued or required. Existing IDs are replaced on subsequent
runs. Services, hidden products, unknown stock and products missing price, image,
title or description are skipped and reported. No identifiers are invented.
Removed or skipped products previously uploaded are not deleted automatically;
remove those in Merchant Center. Schedule regular runs on your deployment runner
after the first successful upload; no recurring schedule is installed by this change.
Google may require additional product attributes and shipping/return configuration
before approving listings. An upload success is not listing approval.

References:
- https://developers.google.com/merchant/api/guides/authorization/access-your-account
- https://developers.google.com/merchant/api/reference/rest/products_v1/accounts.productInputs/insert
