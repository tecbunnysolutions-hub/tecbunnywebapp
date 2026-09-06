-- Keep the WABA Prisma authorization model backed by canonical profile data.
-- The legacy sys_users_prisma relation was never present in production.

DO $$
BEGIN
  IF to_regclass('public.sys_users_prisma') IS NULL THEN
    EXECUTE $view$
      CREATE VIEW public.sys_users_prisma AS
      SELECT
        p.id,
        p.email::text AS email,
        COALESCE(
          NULLIF(profile_data->>'name', ''),
          NULLIF(profile_data->>'full_name', ''),
          p.email::text
        ) AS name,
        COALESCE(
          NULLIF(profile_data->>'phone_number', ''),
          NULLIF(profile_data->>'phone', ''),
          NULLIF(profile_data->>'mobile', '')
        ) AS phone_number,
        NULLIF(profile_data->>'company_id', '') AS organization_id,
        NULLIF(profile_data->>'branch_id', '') AS branch_id,
        role_match.id AS role_id,
        profile_data->'managed_pincodes' AS managed_pincodes,
        p.created_at AS "createdAt"
      FROM public.profiles AS p
      CROSS JOIN LATERAL to_jsonb(p) AS profile_data
      LEFT JOIN LATERAL (
        SELECT r.id
        FROM public.sys_roles AS r
        WHERE lower(r.name) = lower(profile_data->>'role')
          AND (r.org_id::text = profile_data->>'company_id' OR r.org_id IS NULL)
        ORDER BY r.org_id NULLS LAST
        LIMIT 1
      ) AS role_match ON TRUE
    $view$;
  END IF;
END $$;