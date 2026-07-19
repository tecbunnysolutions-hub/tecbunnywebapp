CREATE TABLE IF NOT EXISTS areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  services_enabled boolean NOT NULL DEFAULT false,
  sales_manager_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  service_manager_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

ALTER TABLE area_pincodes
  ADD COLUMN IF NOT EXISTS area_id uuid REFERENCES areas(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

ALTER TABLE user_area_assignments
  ADD COLUMN IF NOT EXISTS area_id uuid REFERENCES areas(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS is_primary boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_areas_active ON areas(is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_area_pincodes_area_id ON area_pincodes(area_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_area_assignments_area_id ON user_area_assignments(area_id) WHERE deleted_at IS NULL;

COMMENT ON TABLE areas IS 'Sales and service operating areas used by superadmin routing.';