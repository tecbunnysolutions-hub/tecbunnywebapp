The API health dashboard automatically selects authentication when checks start.
Set `API_HEALTH_DEMO_EMAIL` and `API_HEALTH_DEMO_PASSWORD` in the API server's
environment to use an existing Supabase demo account. Keep these values server-only.
The dashboard signs in once per run and reuses the access token for that run.
If neither credential is configured, checks reuse the current superadmin session.
If configured demo authentication fails, the run reports the authentication error.

Choose “Current session / custom token” to explicitly check with the current
session or an optional bearer token. Password entry is never required by checks.
Live actions and dynamic route parameters retain their existing configuration rules.
