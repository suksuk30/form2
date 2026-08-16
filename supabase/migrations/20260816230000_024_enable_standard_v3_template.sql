-- Standard V3 landing template (same as standard v2, middle card uses Dana Instan)
-- Position: directly below Standard V2 in admin & user dashboard lists
INSERT INTO landing_templates (id, name, description, sort_order, is_active)
VALUES (
  'standard_v3',
  'Standard V3',
  'Landing page standard versi 3 — kartu tengah Aktifkan Dana Instan',
  5,
  true
)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

UPDATE landing_templates SET sort_order = 6 WHERE id = 'professional';
UPDATE landing_templates SET sort_order = 7 WHERE id = 'enterprise';
UPDATE landing_templates SET sort_order = 8 WHERE id = 'enterprise_v2';
UPDATE landing_templates SET sort_order = 9 WHERE id = 'tokped_v1';
