-- Enable enterprise (Grab) landing template for admin assignment
UPDATE landing_templates
SET is_active = true
WHERE id = 'enterprise';
