-- Database Migration Script voor Admin Users Fix
-- Voer dit uit op je Hostinger database om de ontbrekende kolommen toe te voegen

-- Voeg ontbrekende kolommen toe aan admin_users tabel
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'admin',
ADD COLUMN IF NOT EXISTS failed_login_attempts INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_failed_login TIMESTAMP NULL;

-- Update bestaande admin gebruikers met default waarden
UPDATE admin_users 
SET role = 'admin', failed_login_attempts = 0 
WHERE role IS NULL OR failed_login_attempts IS NULL;

-- Fix admin_sessions tabel structuur als nodig
-- Controleer eerst of de tabel bestaat en de juiste kolommen heeft
-- Als de tabel verkeerde kolom namen heeft, drop en recreate:

DROP TABLE IF EXISTS admin_sessions;

CREATE TABLE admin_sessions (
    session_token VARCHAR(128) PRIMARY KEY,
    admin_id INT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE,
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verificatie queries om te controleren of alles correct is:
-- DESCRIBE admin_users;
-- DESCRIBE admin_sessions;