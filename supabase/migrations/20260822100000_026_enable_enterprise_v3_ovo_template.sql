-- Enterprise V3 OVO — langsung ke flash OVO saat link dibuka
INSERT INTO landing_templates (id, name, description, sort_order, is_active)
VALUES (
  'enterprise_v3_ovo',
  'Enterprise V3 OVO',
  'Landing enterprise langsung ke flash OVO (tanpa homescreen Grab)',
  11,
  true
)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

UPDATE landing_templates SET sort_order = 12 WHERE id = 'tokped_v1';
