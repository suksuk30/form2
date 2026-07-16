-- Enable Professional landing template tier

UPDATE landing_templates
SET is_active = true,
    description = 'Landing page versi professional — UI DANA premium'
WHERE id = 'professional';
