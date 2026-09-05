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
        COALESCE(NULLIF(p.name, ''), NULLIF(p.full_name, ''), p.email::text) AS name,
        COALESCE(p.phone_number, p.phone, p.mobile) AS phone_number,
        p.company_id AS organization_id,
        p.branch_id,
        role_match.id AS role_id,
        p.managed_pincodes,
        p.created_at AS "createdAt"
      FROM public.profiles AS p
      LEFT JOIN LATERAL (
        SELECT r.id
        FROM public.sys_roles AS r
        WHERE lower(r.name) = lower(p.role)
          AND (r.org_id = p.company_id OR r.org_id IS NULL)
        ORDER BY r.org_id NULLS LAST
        LIMIT 1
      ) AS role_match ON TRUE
    $view$;
  END IF;
END $$;