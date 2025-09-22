-- REBELS SPORTS Database Setup
-- Voer dit uit in je Hostinger database

-- Maak lessen tabel
CREATE TABLE IF NOT EXISTS lessons (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    time TIME NOT NULL,
    trainer VARCHAR(255) NOT NULL,
    spots INT NOT NULL DEFAULT 15,
    day_of_week TINYINT NOT NULL COMMENT '1=Maandag, 7=Zondag',
    specific_date DATE NULL COMMENT 'Voor specifieke datum lessen',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_day_time (day_of_week, time),
    INDEX idx_date (specific_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Maak reserveringen tabel
CREATE TABLE IF NOT EXISTS reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lesson_id VARCHAR(36) NOT NULL,
    lesson_date DATE NOT NULL,
    participant_name VARCHAR(255) NOT NULL,
    participant_email VARCHAR(255) NOT NULL,
    participant_phone VARCHAR(20),
    notes TEXT,
    status ENUM('confirmed', 'cancelled', 'pending') DEFAULT 'confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    UNIQUE KEY unique_reservation (lesson_id, lesson_date, participant_email),
    INDEX idx_lesson_date (lesson_id, lesson_date),
    INDEX idx_email (participant_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Maak services tabel
CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active_sort (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Maak admin gebruikers tabel
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Maak sessies tabel voor admin authenticatie
CREATE TABLE IF NOT EXISTS admin_sessions (
    id VARCHAR(128) PRIMARY KEY,
    user_id INT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE,
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Voeg standaard admin gebruiker toe (verander wachtwoord!)
INSERT INTO admin_users (username, password_hash, email) VALUES 
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@rebelssports.nl')
ON DUPLICATE KEY UPDATE username = username;

-- Voeg wat voorbeeld services toe
INSERT INTO services (title, description, price, sort_order) VALUES 
('Personal Training', 'One-on-one training met een ervaren trainer', 75.00, 1),
('Groepslessen', 'Fitness lessen in groepsverband', 25.00, 2),
('Voedingsadvies', 'Persoonlijk voedingsplan en begeleiding', 50.00, 3)
ON DUPLICATE KEY UPDATE title = title;

-- Cleanup oude sessies (voer regelmatig uit)
-- DELETE FROM admin_sessions WHERE expires_at < NOW();