<?php
/**
 * REBELS SPORTS - Database Configuration
 * Voor Hostinger deployment
 */

// Database configuratie - PAS DEZE AAN VOOR HOSTINGER
$host = 'localhost'; // Meestal localhost bij Hostinger
$dbname = 'u123456789_rebels'; // Je database naam bij Hostinger
$username = 'u123456789_user'; // Je database gebruiker
$password = 'JouwSterkWachtwoord123!'; // Je database wachtwoord

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    http_response_code(500);
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