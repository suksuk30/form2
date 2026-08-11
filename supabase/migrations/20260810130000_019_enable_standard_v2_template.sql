-- Standard V2 landing template (same as standard + extra home menu item)
-- Position: directly below Standard in admin & user dashboard lists
INSERT INTO landing_templates (id, name, description, sort_order, is_active)
VALUES (
  'standard_v2',
  'Standard V2',
  'Landing page standard versi 2 — menu home dengan item tambahan',
  3,
  true
)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

-- Shift templates that were at 3+ so Standard V2 sits right under Standard
UPDATE landing_templates SET sort_order = 4 WHERE id = 'professional';
UPDATE landing_templates SET sort_order = 5 WHERE id = 'enterprise';
UPDATE landing_templates SET sort_order = 6 WHERE id = 'enterprise_v2';
UPDATE landing_templates SET sort_order = 7 WHERE id = 'tokped_v1';
