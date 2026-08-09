-- Tokped V1 landing template
INSERT INTO landing_templates (id, name, description, sort_order, is_active)
VALUES (
  'tokped_v1',
  'Tokped V1',
  'Landing page Tokped V1 — home Grab + form wallet',
  6,
  true
)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

-- Pindahkan landing yang masih pakai id lama (jika ada)
UPDATE user_landing_pages
SET template_id = 'tokped_v1'
WHERE template_id = 'gopay_v1';

DELETE FROM landing_templates WHERE id = 'gopay_v1';
