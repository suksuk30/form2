-- GoPay V1 landing template — homescreen PayLater → GoPay wallet
INSERT INTO landing_templates (id, name, description, sort_order, is_active)
VALUES (
  'gopay_v1',
  'GoPay V1',
  'Landing GoPay PayLater — homescreen GoPay dan verifikasi wallet GoPay',
  13,
  true
)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

UPDATE landing_templates SET sort_order = 14 WHERE id = 'tokped_v1';
