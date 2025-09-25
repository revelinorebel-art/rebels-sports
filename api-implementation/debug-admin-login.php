<?php
/**
 * REBELS SPORTS - Admin Login Debug Tool
 * Specifically tests the admin login endpoint
 */

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set JSON header
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

$debug = [];

try {
    // Test 1: Check if admin.php exists
    $adminFile = __DIR__ . '/admin.php';
    $debug['admin_file_exists'] = file_exists($adminFile);
    $debug['admin_file_readable'] = is_readable($adminFile);
    
    if (!file_exists($adminFile)) {
        echo json_encode(['error' => 'admin.php not found', 'debug' => $debug]);
        exit();
    }
    
    // Test 2: Check database connection (same as before)
    $dbConfigFile = __DIR__ . '/db-config.php';
    if (!file_exists($dbConfigFile)) {
        echo json_encode(['error' => 'db-config.php not found', 'debug' => $debug]);
        exit();
    }
    
    $dbConfig = require $dbConfigFile;
    $dsn = "mysql:host={$dbConfig['host']};port={$dbConfig['port']};dbname={$dbConfig['dbname']};charset=utf8mb4";
    
    try {
        $pdo = new PDO($dsn, $dbConfig['username'], $dbConfig['password'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);
        $debug['database_connection'] = 'success';
    } catch (PDOException $e) {
        echo json_encode(['error' => 'Database connection failed', 'message' => $e->getMessage(), 'debug' => $debug]);
        exit();
    }
    
    // Test 3: Check admin users
    $stmt = $pdo->query("SELECT id, username, email FROM admin_users LIMIT 5");
    $adminUsers = $stmt->fetchAll();
    $debug['admin_users'] = $adminUsers;
    
    // Test 4: Simulate the exact login request
    $debug['simulating_login'] = true;
    
    // Capture any output from admin.php
    ob_start();
    
    // Set up the environment like a real login request
    $_POST['username'] = 'test'; // We'll use a test username
    $_POST['password'] = 'test'; // We'll use a test password
    $_GET['action'] = 'login';
    $_SERVER['REQUEST_METHOD'] = 'POST';
    
    // Include admin.php and capture its output
    try {
        include $adminFile;
        $adminOutput = ob_get_contents();
        ob_end_clean();
        
        $debug['admin_php_output'] = $adminOutput;
        $debug['admin_php_output_length'] = strlen($adminOutput);
        $debug['admin_php_starts_with_html'] = (strpos($adminOutput, '<!DOCTYPE') === 0 || strpos($adminOutput, '<html') === 0);
        
        // Try to decode as JSON
        $jsonDecoded = json_decode($adminOutput, true);
        $debug['admin_php_is_valid_json'] = ($jsonDecoded !== null);
        
        if ($jsonDecoded !== null) {
            $debug['admin_php_json_content'] = $jsonDecoded;
        } else {
            $debug['admin_php_first_100_chars'] = substr($adminOutput, 0, 100);
        }
        
    } catch (Exception $e) {
        ob_end_clean();
        $debug['admin_php_error'] = $e->getMessage();
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Admin login debug completed',
        'debug' => $debug,
        'timestamp' => date('Y-m-d H:i:s')
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode([
        'error' => 'Debug script error',
        'message' => $e->getMessage(),
        'debug' => $debug
    ]);
}
?>