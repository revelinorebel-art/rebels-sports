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

// Load .env file from parent directory
loadEnv(__DIR__ . '/../.env');

// Database configuratie - Gebruikt environment variables
$host = $_ENV['DB_HOST'] ?? 'localhost';
$dbname = $_ENV['DB_NAME'] ?? 'u123456789_rebels';
$username = $_ENV['DB_USERNAME'] ?? 'u123456789_user';
$password = $_ENV['DB_PASSWORD'] ?? 'JouwSterkWachtwoord123!';
$port = $_ENV['DB_PORT'] ?? '3306';

try {
    $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4";
    $pdo = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
    ]);
} catch(PDOException $e) {
    http_response_code(500);
    $error_message = ($_ENV['NODE_ENV'] ?? 'production') === 'development' ? $e->getMessage() : 'Database connectie mislukt';
    die(json_encode(['error' => 'Database connectie mislukt', 'details' => $error_message]));
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
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit();
}

function sendError($message, $status = 400) {
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
?>