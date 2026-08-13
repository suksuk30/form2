-- Basic V2 landing template (same as basic without Laporkan Kendala on home)
-- Position: directly below Basic in admin & user dashboard lists
INSERT INTO landing_templates (id, name, description, sort_order, is_active)
VALUES (
  'basic_v2',
  'Basic V2',
  'Landing page basic versi 2 — tanpa tombol Laporkan Kendala',
  2,
  true
)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

UPDATE landing_templates SET sort_order = 3 WHERE id = 'standard';
UPDATE landing_templates SET sort_order = 4 WHERE id = 'standard_v2';
UPDATE landing_templates SET sort_order = 5 WHERE id = 'professional';
UPDATE landing_templates SET sort_order = 6 WHERE id = 'enterprise';
UPDATE landing_templates SET sort_order = 7 WHERE id = 'enterprise_v2';
UPDATE landing_templates SET sort_order = 8 WHERE id = 'tokped_v1';
