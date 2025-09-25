<?php
/**
 * REBELS SPORTS - Database Configuration
 * Voor Hostinger deployment
 */

// Load environment variables from .env file
function loadEnv($path) {
    if (!file_exists($path)) {
        return;
    }
    
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);
        
        if (!array_key_exists($name, $_ENV)) {
            $_ENV[$name] = $value;
        }
    }
}

// Load database configuration
$dbConfigFile = __DIR__ . '/db-config.php';
if (file_exists($dbConfigFile)) {
    $dbConfig = require $dbConfigFile;
    $host = $dbConfig['host'];
    $dbname = $dbConfig['dbname'];
    $username = $dbConfig['username'];
    $password = $dbConfig['password'];
    $port = $dbConfig['port'];
} else {
    // Fallback: probeer environment variables
    loadEnv(__DIR__ . '/../.env');
    $host = $_ENV['DB_HOST'] ?? getenv('DB_HOST');
    $dbname = $_ENV['DB_NAME'] ?? getenv('DB_NAME');
    $username = $_ENV['DB_USERNAME'] ?? getenv('DB_USERNAME');
    $password = $_ENV['DB_PASSWORD'] ?? getenv('DB_PASSWORD');
    $port = $_ENV['DB_PORT'] ?? getenv('DB_PORT') ?? '3306';
}

// Controleer of alle benodigde database variabelen zijn ingesteld
if (!$host || !$dbname || !$username || !$password) {
    error_log("Database configuration missing. Check db-config.php file.");
    die(json_encode(['error' => 'Database configuratie ontbreekt. Controleer de configuratie bestanden.']));
}

try {
    $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4";
    $pdo = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
    ]);
    
    // Log successful connection for debugging
    error_log("Successfully connected to Hostinger MySQL database: $dbname");
    
    // Create tables if they don't exist (MySQL version)
    createMySQLTablesIfNotExist($pdo);
    
} catch(PDOException $e) {
    http_response_code(500);
    error_log("Database connection failed: " . $e->getMessage());
    die(json_encode(['error' => 'Database connectie mislukt', 'details' => $e->getMessage()]));
}

// CORS headers voor frontend
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Utility functions
function sendResponse($data, $status = 200) {
    header('Content-Type: application/json');
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit();
}

function sendError($message, $status = 400) {
    header('Content-Type: application/json');
    http_response_code($status);
    echo json_encode(['error' => $message], JSON_UNESCAPED_UNICODE);
    exit();
}

function validateInput($data, $required_fields) {
    foreach ($required_fields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            sendError("Veld '$field' is verplicht", 400);
        }
    }
}

// Security function
function sanitizeInput($input) {
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}

// UUID generation function
function generateUUID() {
    // Generate a version 4 UUID
    $data = random_bytes(16);
    
    // Set version to 0100
    $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
    // Set bits 6-7 to 10
    $data[8] = chr(ord($data[8]) & 0x3f | 0x80);
    
    // Output the 36 character UUID
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}

// Create tables for MySQL (Hostinger production)
function createMySQLTablesIfNotExist($pdo) {
    // Admin users table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS admin_users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            email VARCHAR(255),
            role VARCHAR(20) DEFAULT 'admin',
            last_login TIMESTAMP NULL,
            failed_login_attempts INT DEFAULT 0,
            last_failed_login TIMESTAMP NULL,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    
    // Admin sessions table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS admin_sessions (
            session_token VARCHAR(128) PRIMARY KEY,
            admin_id INT NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE,
            INDEX idx_expires (expires_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    
    // Lessons table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS lessons (
            id VARCHAR(36) PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            time TIME NOT NULL,
            trainer VARCHAR(255) NOT NULL,
            spots INT NOT NULL DEFAULT 15,
            day_of_week TINYINT NULL COMMENT '1=Maandag, 7=Zondag',
            specific_date DATE NULL COMMENT 'Voor specifieke datum lessen',
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_day_time (day_of_week, time),
            INDEX idx_date (specific_date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    
    // Reservations table
    $pdo->exec("
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    
    // Services table
    $pdo->exec("
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    
    // Insert default admin user if not exists (rebeladmin/rebels123)
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM admin_users WHERE username = ?");
    $stmt->execute(['rebeladmin']);
    if ($stmt->fetchColumn() == 0) {
        $defaultPassword = 'rebels123';
        $hashedPassword = password_hash($defaultPassword, PASSWORD_DEFAULT);
        
        $stmt = $pdo->prepare("
            INSERT INTO admin_users (username, password_hash, email, role) 
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute(['rebeladmin', $hashedPassword, 'admin@rebelssports.nl', 'admin']);
    }
    
    // Insert default services if not exist
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM services");
    $stmt->execute();
    if ($stmt->fetchColumn() == 0) {
        $services = [
            ['Personal Training', 'One-on-one training met een ervaren trainer', 75.00, 1],
            ['Groepslessen', 'Fitness lessen in groepsverband', 25.00, 2],
            ['Voedingsadvies', 'Persoonlijk voedingsplan en begeleiding', 50.00, 3]
        ];
        
        $stmt = $pdo->prepare("
            INSERT INTO services (title, description, price, sort_order) 
            VALUES (?, ?, ?, ?)
        ");
        
        foreach ($services as $service) {
            $stmt->execute($service);
        }
    }
}

// Create tables for SQLite (local development)
function createTablesIfNotExist($pdo) {
    // Admin users table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS admin_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username VARCHAR(50) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(20) DEFAULT 'admin',
            failed_login_attempts INTEGER DEFAULT 0,
            last_failed_login DATETIME NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ");
    
    // Admin sessions table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS admin_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            admin_id INTEGER NOT NULL,
            session_token VARCHAR(255) UNIQUE NOT NULL,
            expires_at DATETIME NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE
        )
    ");
    
    // Lessons table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS lessons (
            id VARCHAR(36) PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            time TIME NOT NULL,
            trainer VARCHAR(255) NOT NULL,
            spots INTEGER NOT NULL DEFAULT 15,
            day_of_week INTEGER NULL,
            specific_date DATE NULL,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ");
    
    // Reservations table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS reservations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lesson_id VARCHAR(36) NOT NULL,
            lesson_date DATE NOT NULL,
            participant_name VARCHAR(255) NOT NULL,
            participant_email VARCHAR(255) NOT NULL,
            participant_phone VARCHAR(20),
            notes TEXT,
            status VARCHAR(20) DEFAULT 'confirmed',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
        )
    ");
    
    // Services table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS services (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            price DECIMAL(10,2) DEFAULT 0.00,
            duration INTEGER DEFAULT 60,
            category VARCHAR(100),
            status VARCHAR(20) DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ");
    
    // Insert default admin user if not exists
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM admin_users WHERE username = ?");
    $stmt->execute(['admin']);
    if ($stmt->fetchColumn() == 0) {
        $defaultPassword = 'password'; // Default password
        $hashedPassword = password_hash($defaultPassword, PASSWORD_DEFAULT);
        
        $stmt = $pdo->prepare("
            INSERT INTO admin_users (username, password_hash, role) 
            VALUES (?, ?, ?)
        ");
        $stmt->execute(['admin', $hashedPassword, 'admin']);
    }
}
?>