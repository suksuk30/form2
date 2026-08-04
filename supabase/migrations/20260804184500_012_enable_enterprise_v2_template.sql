-- Enterprise V2 landing template
INSERT INTO landing_templates (id, name, description, sort_order, is_active)
VALUES (
  'enterprise_v2',
  'Enterprise V2',
  'Landing page enterprise versi 2 (Grab)',
  5,
  true
)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;
