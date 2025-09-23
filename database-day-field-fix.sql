-- REBELS SPORTS Database Fix
-- Maak day_of_week veld optioneel voor lessen
-- Voer dit uit in je Hostinger database

-- Pas de lessons tabel aan om day_of_week optioneel te maken
ALTER TABLE lessons 
MODIFY COLUMN day_of_week TINYINT NULL COMMENT '1=Maandag, 7=Zondag (optioneel voor specifieke datum lessen)';

-- Update bestaande lessen zonder day_of_week om NULL te zijn als ze een specific_date hebben
UPDATE lessons 
SET day_of_week = NULL 
WHERE specific_date IS NOT NULL AND day_of_week IS NOT NULL;

-- Voeg een check constraint toe om ervoor te zorgen dat ofwel day_of_week ofwel specific_date is ingevuld
-- (Dit is optioneel, maar helpt bij data integriteit)
-- ALTER TABLE lessons 
-- ADD CONSTRAINT chk_day_or_date 
-- CHECK (day_of_week IS NOT NULL OR specific_date IS NOT NULL);