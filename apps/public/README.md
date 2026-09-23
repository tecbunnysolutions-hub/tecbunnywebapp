# Public storefront

Customer pages, SEO, and browser interactions live here. Business mutations and
integrations use the central API through the `/api/*` rewrite. Only document-discovery
route handlers remain local; public server-rendered pages may perform read-only queries.

Run from the repository root:

```sh
npm run dev --workspace=tecbunny-store
npm run build:prod --workspace=tecbunny-store
npm run start --workspace=tecbunny-store
```

Development uses port 9003. Set `NEXT_PUBLIC_API_URL` to the API origin in this app's
`.env.local`. Tailwind styles are compiled by Next.js/PostCSS from `src/app/globals.css`.
See the [root setup guide](../../README.md) and [architecture](../../docs/architecture.md).
