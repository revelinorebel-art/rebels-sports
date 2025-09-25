<?php
/**
 * REBELS SPORTS - Enhanced Admin API Debug Version
 * Use this to debug connection issues with detailed testing
 */

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set JSON header immediately
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$debugInfo = [];

try {
    // Test 1: Check if db-config.php exists and is readable
    $dbConfigFile = __DIR__ . '/db-config.php';
    $debugInfo['config_file_exists'] = file_exists($dbConfigFile);
    $debugInfo['config_file_readable'] = is_readable($dbConfigFile);
    $debugInfo['config_file_path'] = $dbConfigFile;
    
    if (!file_exists($dbConfigFile)) {
        echo json_encode(['error' => 'db-config.php file not found', 'debug' => $debugInfo]);
        exit();
    }
    
    // Test 2: Load and validate database config
    $dbConfig = require $dbConfigFile;
    $debugInfo['config_loaded'] = !empty($dbConfig);
    $debugInfo['config_is_array'] = is_array($dbConfig);
    
    if (!$dbConfig || !is_array($dbConfig)) {
        echo json_encode(['error' => 'Invalid db-config.php format', 'debug' => $debugInfo]);
        exit();
    }
    
    // Test 3: Check all required fields are present
    $required = ['host', 'dbname', 'username', 'password', 'port'];
    $debugInfo['config_fields'] = [];
    foreach ($required as $field) {
        $debugInfo['config_fields'][$field] = [
            'exists' => isset($dbConfig[$field]),
            'not_empty' => !empty($dbConfig[$field]),
            'value_length' => isset($dbConfig[$field]) ? strlen($dbConfig[$field]) : 0
        ];
        
        if (!isset($dbConfig[$field]) || empty($dbConfig[$field])) {
            echo json_encode(['error' => "Missing database config: $field", 'debug' => $debugInfo]);
            exit();
        }
    }
    
    // Test 4: Show connection details (without password)
    $debugInfo['connection_details'] = [
        'host' => $dbConfig['host'],
        'port' => $dbConfig['port'],
        'dbname' => $dbConfig['dbname'],
        'username' => $dbConfig['username'],
        'password_length' => strlen($dbConfig['password']),
        'charset' => $dbConfig['charset'] ?? 'utf8mb4'
    ];
    
    // Test 5: Try different connection methods
    $dsn = "mysql:host={$dbConfig['host']};port={$dbConfig['port']};dbname={$dbConfig['dbname']};charset=utf8mb4";
    $debugInfo['dsn'] = $dsn;
    
    // First attempt with provided credentials
    try {
        $pdo = new PDO($dsn, $dbConfig['username'], $dbConfig['password'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
        ]);
        
        $debugInfo['connection_successful'] = true;
        
        // Test 6: Check database and tables
        $stmt = $pdo->query("SELECT DATABASE() as current_db");
        $currentDb = $stmt->fetch()['current_db'];
        $debugInfo['current_database'] = $currentDb;
        
        // Check if admin_users table exists
        $stmt = $pdo->query("SHOW TABLES LIKE 'admin_users'");
        $tableExists = $stmt->rowCount() > 0;
        $debugInfo['admin_users_table_exists'] = $tableExists;
        
        if ($tableExists) {
            $stmt = $pdo->query("SELECT COUNT(*) as count FROM admin_users");
            $userCount = $stmt->fetch()['count'];
            $debugInfo['admin_users_count'] = $userCount;
        }
        
        // Success response
        echo json_encode([
            'success' => true,
            'message' => 'Database connection successful',
            'debug' => $debugInfo,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        
    } catch (PDOException $e) {
        $debugInfo['connection_error'] = [
            'message' => $e->getMessage(),
            'code' => $e->getCode(),
            'error_info' => $e->errorInfo ?? null
        ];
        
        // Test 6: Try alternative connection without charset
        try {
            $dsn2 = "mysql:host={$dbConfig['host']};port={$dbConfig['port']};dbname={$dbConfig['dbname']}";
            $pdo2 = new PDO($dsn2, $dbConfig['username'], $dbConfig['password'], [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]);
            
            $debugInfo['alternative_connection_successful'] = true;
            echo json_encode([
                'success' => true,
                'message' => 'Alternative connection successful',
                'debug' => $debugInfo,
                'note' => 'Main connection failed but alternative worked'
            ]);
            
        } catch (PDOException $e2) {
            $debugInfo['alternative_connection_error'] = [
                'message' => $e2->getMessage(),
                'code' => $e2->getCode()
            ];
            
            echo json_encode([
                'error' => 'All database connections failed',
                'debug' => $debugInfo
            ]);
        }
    }
    
} catch (Exception $e) {
    echo json_encode([
        'error' => 'General error',
        'message' => $e->getMessage(),
        'debug' => $debugInfo ?? []
    ]);
}
?>