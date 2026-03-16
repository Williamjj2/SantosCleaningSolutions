-- EXAMPLES FOR TESTING pricing logic via SQL Editor

-- 1. Simple Quote: 3 Bed / 2 Bath Regular Cleaning
SELECT calculate_quote(3, 2, 'Marietta', 'regular');

-- 2. Deep Cleaning with Addons (Oven + Fridge) in Alpharetta (Premium Area)
SELECT calculate_quote(
  4, 
  3, 
  'Alpharetta', 
  'profunda', 
  ARRAY['forno_dentro', 'geladeira_dentro']
);

-- 3. Move-out Cleaning with Pets
SELECT calculate_quote(
  2, 
  2, 
  'Smyrna', 
  'mudanca', 
  NULL, -- No addons
  FALSE, -- Airbnb
  FALSE, -- Saturday
  TRUE   -- Has Pets
);
