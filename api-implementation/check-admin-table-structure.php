<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'config.php';

try {
    // Get the table structure
    $stmt = $pdo->prepare("DESCRIBE admin_users");
    $stmt->execute();
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Also get a sample record to see the data
    $stmt2 = $pdo->prepare("SELECT * FROM admin_users LIMIT 1");
    $stmt2->execute();
    $sampleRecord = $stmt2->fetch(PDO::FETCH_ASSOC);
    
    // Hide the actual password value for security
    if ($sampleRecord && isset($sampleRecord['password'])) {
        $sampleRecord['password'] = '[HIDDEN]';
    }
    if ($sampleRecord && isset($sampleRecord['password_hash'])) {
        $sampleRecord['password_hash'] = '[HIDDEN]';
    }
    if ($sampleRecord && isset($sampleRecord['passwd'])) {
        $sampleRecord['passwd'] = '[HIDDEN]';
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Admin users tabel structuur',
        'table_columns' => $columns,
        'sample_record' => $sampleRecord,
        'analysis' => [
            'total_columns' => count($columns),
            'column_names' => array_column($columns, 'Field'),
            'password_column_candidates' => array_filter(array_column($columns, 'Field'), function($col) {
                return stripos($col, 'pass') !== false || stripos($col, 'pwd') !== false;
            })
        ]
    ]);
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage(),
        'code' => $e->getCode()
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'General error: ' . $e->getMessage()
    ]);
}
?>