<?php
/**
 * REBELS SPORTS - Comprehensive Database Credential Test
 * Tests multiple scenarios to identify the exact database issue
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$results = [];

// Test 1: Basic connection info
$results['test_info'] = [
    'timestamp' => date('Y-m-d H:i:s'),
    'php_version' => phpversion(),
    'pdo_available' => extension_loaded('pdo'),
    'pdo_mysql_available' => extension_loaded('pdo_mysql')
];

// Test 2: Try the credentials you provided
$credentials = [
    'host' => 'localhost',
    'port' => '3306',
    'dbname' => 'u130570185_rebelssports',
    'username' => 'u130570185_rebeldata',
    'password' => '8e|$jrT;CMFZ'
];

$results['provided_credentials'] = [
    'host' => $credentials['host'],
    'port' => $credentials['port'],
    'dbname' => $credentials['dbname'],
    'username' => $credentials['username'],
    'password_length' => strlen($credentials['password'])
];

// Test 3: Try connection with provided credentials
try {
    $dsn = "mysql:host={$credentials['host']};port={$credentials['port']};dbname={$credentials['dbname']};charset=utf8mb4";
    $pdo = new PDO($dsn, $credentials['username'], $credentials['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    
    $results['connection_test'] = [
        'success' => true,
        'message' => 'Connection successful with provided credentials'
    ];
    
} catch (PDOException $e) {
    $results['connection_test'] = [
        'success' => false,
        'error_message' => $e->getMessage(),
        'error_code' => $e->getCode(),
        'error_info' => $e->errorInfo
    ];
}

// Test 4: Try connection without specifying database (to test user access)
try {
    $dsn_no_db = "mysql:host={$credentials['host']};port={$credentials['port']};charset=utf8mb4";
    $pdo_no_db = new PDO($dsn_no_db, $credentials['username'], $credentials['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    
    // Get list of accessible databases
    $stmt = $pdo_no_db->query("SHOW DATABASES");
    $databases = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    $results['user_access_test'] = [
        'success' => true,
        'message' => 'User can connect to MySQL server',
        'accessible_databases' => $databases
    ];
    
} catch (PDOException $e) {
    $results['user_access_test'] = [
        'success' => false,
        'error_message' => $e->getMessage(),
        'error_code' => $e->getCode()
    ];
}

// Test 5: Try alternative common Hostinger patterns
$alternative_credentials = [
    [
        'host' => 'localhost',
        'username' => 'u130570185_rebelssports', // Sometimes username matches database name
        'password' => 'Rebels@2024',
        'dbname' => 'u130570185_rebelssports'
    ],
    [
        'host' => 'localhost',
        'username' => 'u130570185_admin', // Common admin pattern
        'password' => 'Rebels@2024',
        'dbname' => 'u130570185_rebelssports'
    ]
];

$results['alternative_tests'] = [];

foreach ($alternative_credentials as $index => $alt_creds) {
    try {
        $dsn = "mysql:host={$alt_creds['host']};port=3306;dbname={$alt_creds['dbname']};charset=utf8mb4";
        $pdo_alt = new PDO($dsn, $alt_creds['username'], $alt_creds['password'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);
        
        $results['alternative_tests'][$index] = [
            'credentials' => [
                'username' => $alt_creds['username'],
                'dbname' => $alt_creds['dbname']
            ],
            'success' => true,
            'message' => 'Alternative credentials worked!'
        ];
        
    } catch (PDOException $e) {
        $results['alternative_tests'][$index] = [
            'credentials' => [
                'username' => $alt_creds['username'],
                'dbname' => $alt_creds['dbname']
            ],
            'success' => false,
            'error_message' => $e->getMessage(),
            'error_code' => $e->getCode()
        ];
    }
}

// Test 6: Check if we can connect to MySQL at all (without credentials)
try {
    $dsn_test = "mysql:host=localhost;port=3306";
    // This will fail but tells us if MySQL is running
    $pdo_test = new PDO($dsn_test, 'nonexistent', 'nonexistent');
} catch (PDOException $e) {
    $results['mysql_server_test'] = [
        'mysql_running' => (strpos($e->getMessage(), 'Access denied') !== false),
        'error_message' => $e->getMessage()
    ];
}

// Final recommendations
$results['recommendations'] = [
    'check_hostinger_panel' => 'Verify database name, username, and password in Hostinger control panel',
    'common_issues' => [
        'Username might be different (try u130570185_rebelssports)',
        'Password might be case-sensitive',
        'Database user might not have proper permissions',
        'Database might not exist yet'
    ]
];

echo json_encode($results, JSON_PRETTY_PRINT);
?>