-- =====================================================
-- REBELS SPORTS - Hostinger Database Setup
-- Volledige database setup voor productie deployment
-- =====================================================

-- Stel character set en collation in
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- TABELLEN AANMAKEN
-- =====================================================

-- Trainers tabel
CREATE TABLE IF NOT EXISTS trainers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    specialization VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    icon_type VARCHAR(50) DEFAULT 'star',
    color_gradient VARCHAR(100) DEFAULT 'from-blue-500 to-purple-500',
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active_sort (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Lessen tabel (uitgebreid)
CREATE TABLE IF NOT EXISTS lessons (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    time TIME NOT NULL,
    trainer_id INT NULL,
    trainer_name VARCHAR(255) NOT NULL,
    spots INT NOT NULL DEFAULT 15,
    day_of_week TINYINT NOT NULL COMMENT '1=Maandag, 7=Zondag',
    specific_date DATE NULL COMMENT 'Voor specifieke datum lessen',
    description TEXT,
    location VARCHAR(255) DEFAULT 'Rebels Sports',
    price DECIMAL(10,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (trainer_id) REFERENCES trainers(id) ON DELETE SET NULL,
    INDEX idx_day_time (day_of_week, time),
    INDEX idx_date (specific_date),
    INDEX idx_trainer (trainer_id),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reserveringen tabel
CREATE TABLE IF NOT EXISTS reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lesson_id VARCHAR(36) NOT NULL,
    lesson_date DATE NOT NULL,
    participant_name VARCHAR(255) NOT NULL,
    participant_email VARCHAR(255) NOT NULL,
    participant_phone VARCHAR(20),
    notes TEXT,
    status ENUM('confirmed', 'cancelled', 'pending', 'waitlist') DEFAULT 'confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    UNIQUE KEY unique_reservation (lesson_id, lesson_date, participant_email),
    INDEX idx_lesson_date (lesson_id, lesson_date),
    INDEX idx_email (participant_email),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Services tabel
CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    category VARCHAR(100) DEFAULT 'general',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active_sort (is_active, sort_order),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admin gebruikers tabel
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    full_name VARCHAR(255),
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    role ENUM('admin', 'manager', 'staff') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admin sessies tabel
CREATE TABLE IF NOT EXISTS admin_sessions (
    id VARCHAR(128) PRIMARY KEY,
    user_id INT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE,
    INDEX idx_expires (expires_at),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contact berichten tabel
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    message TEXT NOT NULL,
    status ENUM('new', 'read', 'replied', 'archived') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- INITIËLE DATA INVOEGEN
-- =====================================================

-- Trainers data
INSERT INTO trainers (name, specialization, description, image_url, icon_type, color_gradient, sort_order) VALUES 
('Miranda', 'Freestyle', 'Onze energieke Freestyle trainer die je helpt om je creativiteit en kracht te ontdekken door dynamische bewegingen en vrije expressie.', '/trainers/Miranda.jpg', 'zap', 'from-purple-500 to-pink-500', 1),
('Viviane', 'Yin Yoga & Pilates', 'Specialist in Yin Yoga en Pilates, begeleidt je naar innerlijke rust en flexibiliteit door zachte, meditatieve bewegingen en bewuste ademhaling.', '/trainers/Viviane.jpg', 'heart', 'from-green-500 to-teal-500', 2),
('Sherrine', 'Zumba', 'Onze enthousiaste Zumba instructeur die je meeneemt in een wervelwind van Latijnse ritmes en energieke dansbewegingen.', '/api/placeholder/300/400', 'star', 'from-orange-500 to-red-500', 3),
('Sandra', 'Latin Line', 'Expert in Latin Line dans, combineert passie voor Latijnse muziek met gestructureerde choreografieën voor een geweldige workout.', '/trainers/SANDRA.jpg', 'star', 'from-yellow-500 to-orange-500', 4),
('Bo', 'Bal Pilates', 'Gespecialiseerd in Bal Pilates, gebruikt innovatieve technieken met de fitnessbal voor core versterking en balans verbetering.', '/trainers/BO.jpg', 'award', 'from-blue-500 to-purple-500', 5),
('Marcel Tomasowa', 'Blessure Specialist', 'Onze expert in blessurepreventie en herstel. Marcel begeleidt je professioneel bij het voorkomen van blessures en het veilig herstellen van verwondingen.', '/trainers/Marcel Tomasoha.jpg', 'award', 'from-indigo-500 to-blue-500', 6),
('Reggie', 'Inner Reset', 'Begeleidt je met energetische sessies voor ontspanning, balans en herstel van lichaam en geest. Specialist in holistische wellness en mindfulness.', '/trainers/REGGIE.jpg', 'heart', 'from-teal-500 to-green-500', 7)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Services data
INSERT INTO services (title, description, price, category, sort_order) VALUES 
('Personal Training', 'One-on-one training met een ervaren trainer voor maximale resultaten', 75.00, 'training', 1),
('Groepslessen', 'Fitness lessen in groepsverband voor motivatie en gezelligheid', 25.00, 'classes', 2),
('Voedingsadvies', 'Persoonlijk voedingsplan en begeleiding van onze experts', 50.00, 'nutrition', 3),
('Blessure Begeleiding', 'Professionele begeleiding bij blessurepreventie en herstel', 65.00, 'therapy', 4),
('Yoga & Pilates', 'Ontspanning en flexibiliteit door Yoga en Pilates sessies', 30.00, 'classes', 5),
('Zumba & Dans', 'Energieke danslessen voor conditie en plezier', 28.00, 'classes', 6)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- Admin gebruiker (VERANDER HET WACHTWOORD!)
INSERT INTO admin_users (username, password_hash, email, full_name, role) VALUES 
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@rebelssports.nl', 'Administrator', 'admin')
ON DUPLICATE KEY UPDATE username = VALUES(username);

-- Voorbeeld lessen (gebruik UUID's)
INSERT INTO lessons (id, title, time, trainer_name, spots, day_of_week, description, location, price) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'Yoga Flow', '09:00:00', 'Viviane', 15, 1, 'Een rustige start van de week met Yoga Flow', 'Studio 1', 25.00),
('550e8400-e29b-41d4-a716-446655440002', 'Zumba Party', '19:00:00', 'Sherrine', 20, 1, 'Energieke Zumba sessie om de week goed te beginnen', 'Studio 2', 28.00),
('550e8400-e29b-41d4-a716-446655440003', 'Pilates Core', '18:00:00', 'Bo', 12, 2, 'Intensieve core training met Pilates', 'Studio 1', 30.00),
('550e8400-e29b-41d4-a716-446655440004', 'Latin Line', '20:00:00', 'Sandra', 18, 2, 'Latijnse dansbewegingen in lijn formatie', 'Studio 2', 28.00),
('550e8400-e29b-41d4-a716-446655440005', 'Freestyle', '17:00:00', 'Miranda', 15, 3, 'Vrije beweging en expressie', 'Studio 1', 25.00),
('550e8400-e29b-41d4-a716-446655440006', 'Inner Reset', '19:30:00', 'Reggie', 10, 3, 'Ontspanning en energetisch herstel', 'Studio 3', 35.00),
('550e8400-e29b-41d4-a716-446655440007', 'Bal Pilates', '18:30:00', 'Bo', 12, 4, 'Pilates met fitnessbal voor extra uitdaging', 'Studio 1', 30.00),
('550e8400-e29b-41d4-a716-446655440008', 'Yin Yoga', '20:00:00', 'Viviane', 15, 4, 'Diepe ontspanning door Yin Yoga', 'Studio 1', 25.00),
('550e8400-e29b-41d4-a716-446655440009', 'Zumba Gold', '10:00:00', 'Sherrine', 20, 5, 'Zumba aangepast voor alle leeftijden', 'Studio 2', 28.00),
('550e8400-e29b-41d4-a716-446655440010', 'Latin Dance', '20:00:00', 'Sandra', 18, 5, 'Vrolijke Latijnse danslessen', 'Studio 2', 28.00)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- =====================================================
-- VIEWS VOOR RAPPORTAGE
-- =====================================================

-- View voor les statistieken
CREATE OR REPLACE VIEW lesson_stats AS
SELECT 
    l.id,
    l.title,
    l.trainer_name,
    l.day_of_week,
    l.time,
    l.spots,
    COUNT(r.id) as total_reservations,
    (l.spots - COUNT(r.id)) as available_spots,
    ROUND((COUNT(r.id) / l.spots) * 100, 2) as occupancy_percentage
FROM lessons l
LEFT JOIN reservations r ON l.id = r.lesson_id 
    AND r.status = 'confirmed'
    AND r.lesson_date >= CURDATE()
WHERE l.is_active = 1
GROUP BY l.id, l.title, l.trainer_name, l.day_of_week, l.time, l.spots;

-- View voor trainer overzicht
CREATE OR REPLACE VIEW trainer_overview AS
SELECT 
    t.id,
    t.name,
    t.specialization,
    COUNT(l.id) as total_lessons,
    COUNT(DISTINCT r.id) as total_reservations
FROM trainers t
LEFT JOIN lessons l ON t.name = l.trainer_name AND l.is_active = 1
LEFT JOIN reservations r ON l.id = r.lesson_id AND r.status = 'confirmed'
WHERE t.is_active = 1
GROUP BY t.id, t.name, t.specialization;

-- =====================================================
-- STORED PROCEDURES
-- =====================================================

DELIMITER //

-- Procedure voor het ophalen van beschikbare plekken
CREATE PROCEDURE GetAvailableSpots(
    IN lesson_id_param VARCHAR(36),
    IN lesson_date_param DATE,
    OUT available_spots INT
)
BEGIN
    DECLARE total_spots INT DEFAULT 0;
    DECLARE reserved_spots INT DEFAULT 0;
    
    -- Haal totaal aantal plekken op
    SELECT spots INTO total_spots 
    FROM lessons 
    WHERE id = lesson_id_param AND is_active = 1;
    
    -- Haal aantal gereserveerde plekken op
    SELECT COUNT(*) INTO reserved_spots
    FROM reservations 
    WHERE lesson_id = lesson_id_param 
    AND lesson_date = lesson_date_param 
    AND status = 'confirmed';
    
    -- Bereken beschikbare plekken
    SET available_spots = total_spots - reserved_spots;
    
    -- Zorg ervoor dat het niet negatief wordt
    IF available_spots < 0 THEN
        SET available_spots = 0;
    END IF;
END //

DELIMITER ;

-- =====================================================
-- TRIGGERS
-- =====================================================

DELIMITER //

-- Trigger voor automatische cleanup van verlopen sessies
CREATE TRIGGER cleanup_expired_sessions
    BEFORE INSERT ON admin_sessions
    FOR EACH ROW
BEGIN
    DELETE FROM admin_sessions WHERE expires_at < NOW();
END //

DELIMITER ;

-- =====================================================
-- INDEXEN VOOR PRESTATIES
-- =====================================================

-- Extra indexen voor betere prestaties
CREATE INDEX idx_reservations_date_status ON reservations(lesson_date, status);
CREATE INDEX idx_lessons_trainer_day ON lessons(trainer_name, day_of_week);
CREATE INDEX idx_contact_messages_status_date ON contact_messages(status, created_at);

-- =====================================================
-- RECHTEN EN BEVEILIGING
-- =====================================================

-- Heractiveer foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- MAINTENANCE QUERIES (uitvoeren als onderhoud)
-- =====================================================

-- Cleanup oude sessies (voer wekelijks uit)
-- DELETE FROM admin_sessions WHERE expires_at < NOW();

-- Cleanup oude reserveringen (voer maandelijks uit)
-- DELETE FROM reservations WHERE lesson_date < DATE_SUB(CURDATE(), INTERVAL 6 MONTH);

-- Backup belangrijke data (voer dagelijks uit)
-- CREATE TABLE lessons_backup AS SELECT * FROM lessons;
-- CREATE TABLE reservations_backup AS SELECT * FROM reservations;

-- =====================================================
-- EINDE VAN SETUP
-- =====================================================

-- Toon overzicht van aangemaakte tabellen
SHOW TABLES;

-- Toon aantal records per tabel
SELECT 'trainers' as table_name, COUNT(*) as record_count FROM trainers
UNION ALL
SELECT 'lessons', COUNT(*) FROM lessons
UNION ALL
SELECT 'services', COUNT(*) FROM services
UNION ALL
SELECT 'admin_users', COUNT(*) FROM admin_users;