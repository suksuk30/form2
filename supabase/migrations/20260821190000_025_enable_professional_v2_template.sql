-- Professional V2 landing template — Pusat Layanan homescreen (list cards)
INSERT INTO landing_templates (id, name, description, sort_order, is_active)
VALUES (
  'professional_v2',
  'Professional V2',
  'Landing page professional versi 2 — homescreen Pusat Layanan seperti aplikasi DANA',
  7,
  true
)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

UPDATE landing_templates SET sort_order = 8 WHERE id = 'enterprise';
UPDATE landing_templates SET sort_order = 9 WHERE id = 'enterprise_v2';
UPDATE landing_templates SET sort_order = 10 WHERE id = 'tokped_v1';
