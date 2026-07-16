-- Enable Standard landing template tier

UPDATE landing_templates
SET is_active = true,
    description = 'Landing page versi standard — UI modern emerald'
WHERE id = 'standard';
