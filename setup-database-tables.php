<?php
// REBELS SPORTS - Database Tables Setup Tool
// Upload dit bestand naar public_html/ en bezoek het via je browser

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Laad environment variables
if (file_exists('.env')) {
    $lines = file('.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '#') === 0 || strpos($line, '=') === false) continue;
        list($key, $value) = explode('=', $line, 2);
        $_ENV[trim($key)] = trim($value);
    }
}

$host = $_ENV['DB_HOST'] ?? 'localhost';
$dbname = $_ENV['DB_NAME'] ?? '';
$username = $_ENV['DB_USERNAME'] ?? '';
$password = $_ENV['DB_PASSWORD'] ?? '';
$port = $_ENV['DB_PORT'] ?? '3306';

?>
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rebels Sports - Database Setup</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #e74c3c; text-align: center; margin-bottom: 30px; }
        .status { padding: 15px; margin: 10px 0; border-radius: 5px; }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
        .warning { background: #fff3cd; color: #856404; border: 1px solid #ffeaa7; }
        .btn { background: #e74c3c; color: white; padding: 12px 24px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; margin: 10px 5px; }
        .btn:hover { background: #c0392b; }
        .btn-secondary { background: #6c757d; }
        .btn-secondary:hover { background: #545b62; }
        pre { background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto; }
        .step { margin: 20px 0; padding: 15px; border-left: 4px solid #e74c3c; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏋️ Rebels Sports Database Setup</h1>
        
        <?php if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['setup_tables'])): ?>
            
            <div class="status info">
                <strong>🔧 Database tabellen aanmaken...</strong>
            </div>
            
            <?php
            try {
                $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4";
                $pdo = new PDO($dsn, $username, $password, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
                ]);
                
                echo '<div class="status success">✅ Database verbinding succesvol!</div>';
                
                // SQL statements voor tabellen
                $sql_statements = [
                    "CREATE TABLE IF NOT EXISTS lessons (
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
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
                    
                    "CREATE TABLE IF NOT EXISTS reservations (
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
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
                    
                    "CREATE TABLE IF NOT EXISTS services (
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
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
                    
                    "CREATE TABLE IF NOT EXISTS admin_users (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        username VARCHAR(50) UNIQUE NOT NULL,
                        password_hash VARCHAR(255) NOT NULL,
                        email VARCHAR(255),
                        last_login TIMESTAMP NULL,
                        is_active BOOLEAN DEFAULT TRUE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
                    
                    "CREATE TABLE IF NOT EXISTS admin_sessions (
                        id VARCHAR(128) PRIMARY KEY,
                        user_id INT NOT NULL,
                        expires_at TIMESTAMP NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE,
                        INDEX idx_expires (expires_at)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
                ];
                
                // Voer elke SQL statement uit
                foreach ($sql_statements as $index => $sql) {
                    try {
                        $pdo->exec($sql);
                        $table_names = ['lessons', 'reservations', 'services', 'admin_users', 'admin_sessions'];
                        echo '<div class="status success">✅ Tabel "' . $table_names[$index] . '" aangemaakt</div>';
                    } catch (PDOException $e) {
                        echo '<div class="status error">❌ Fout bij aanmaken tabel: ' . $e->getMessage() . '</div>';
                    }
                }
                
                // Voeg standaard data toe
                try {
                    $pdo->exec("INSERT INTO admin_users (username, password_hash, email) VALUES 
                        ('admin', '\$2y\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@rebelssports.nl')
                        ON DUPLICATE KEY UPDATE username = username");
                    echo '<div class="status success">✅ Standaard admin gebruiker toegevoegd</div>';
                } catch (PDOException $e) {
                    echo '<div class="status warning">⚠️ Admin gebruiker al aanwezig of fout: ' . $e->getMessage() . '</div>';
                }
                
                try {
                    $pdo->exec("INSERT INTO services (title, description, price, sort_order) VALUES 
                        ('Personal Training', 'One-on-one training met een ervaren trainer', 75.00, 1),
                        ('Groepslessen', 'Fitness lessen in groepsverband', 25.00, 2),
                        ('Voedingsadvies', 'Persoonlijk voedingsplan en begeleiding', 50.00, 3)
                        ON DUPLICATE KEY UPDATE title = title");
                    echo '<div class="status success">✅ Standaard services toegevoegd</div>';
                } catch (PDOException $e) {
                    echo '<div class="status warning">⚠️ Services al aanwezig of fout: ' . $e->getMessage() . '</div>';
                }
                
                echo '<div class="status success"><strong>🎉 Database setup voltooid!</strong></div>';
                echo '<div class="status info">Je kunt nu de debug tool opnieuw uitvoeren om te controleren of alles werkt.</div>';
                
            } catch (PDOException $e) {
                echo '<div class="status error">❌ Database fout: ' . $e->getMessage() . '</div>';
            }
            ?>
            
        <?php else: ?>
            
            <div class="status info">
                <strong>📋 Database Setup Instructies</strong><br>
                Dit script maakt alle benodigde database tabellen aan voor Rebels Sports.
            </div>
            
            <div class="step">
                <h3>🔍 Huidige Database Configuratie:</h3>
                <pre>Host: <?= htmlspecialchars($host) ?>
Database: <?= htmlspecialchars($dbname) ?>
Username: <?= htmlspecialchars($username) ?>
Port: <?= htmlspecialchars($port) ?></pre>
            </div>
            
            <div class="step">
                <h3>📊 Tabellen die aangemaakt worden:</h3>
                <ul>
                    <li><strong>lessons</strong> - Voor groepslessen en schema's</li>
                    <li><strong>reservations</strong> - Voor les reserveringen</li>
                    <li><strong>services</strong> - Voor diensten en prijzen</li>
                    <li><strong>admin_users</strong> - Voor admin gebruikers</li>
                    <li><strong>admin_sessions</strong> - Voor admin sessies</li>
                </ul>
            </div>
            
            <div class="step">
                <h3>⚠️ Belangrijk:</h3>
                <ul>
                    <li>Zorg dat je .env bestand correct is geconfigureerd</li>
                    <li>Dit script gebruikt CREATE TABLE IF NOT EXISTS (veilig om opnieuw uit te voeren)</li>
                    <li>Standaard admin login: admin / password (verander dit!)</li>
                </ul>
            </div>
            
            <form method="POST">
                <button type="submit" name="setup_tables" class="btn">🚀 Database Tabellen Aanmaken</button>
            </form>
            
        <?php endif; ?>
        
        <div style="margin-top: 30px; text-align: center;">
            <a href="debug-database-connection.php" class="btn btn-secondary">🔍 Database Testen</a>
            <a href="/" class="btn btn-secondary">🏠 Terug naar Website</a>
        </div>
    </div>
</body>
</html>