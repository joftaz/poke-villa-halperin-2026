-- Fix rows where protein/sauce were inserted as JSON strings while the column
-- was still TEXT (before the TEXT[] migration). Those values look like:
--   protein = {'["egg_strip","tofu"]'}   (one-element array containing a JSON array string)
--   protein = {'[]'}                     (one-element array containing empty JSON array)

-- Fix protein
UPDATE public.orders
SET protein = ARRAY(SELECT json_array_elements_text(protein[1]::json))
WHERE array_length(protein, 1) = 1
  AND protein[1] ~ '^\[.';

UPDATE public.orders
SET protein = '{}'
WHERE array_length(protein, 1) = 1
  AND protein[1] = '[]';

-- Fix sauce
UPDATE public.orders
SET sauce = ARRAY(SELECT json_array_elements_text(sauce[1]::json))
WHERE array_length(sauce, 1) = 1
  AND sauce[1] ~ '^\[.';

UPDATE public.orders
SET sauce = '{}'
WHERE array_length(sauce, 1) = 1
  AND sauce[1] = '[]';
