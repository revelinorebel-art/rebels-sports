<?php
require_once 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

try {
    // Check if specific_date column exists
    $stmt = $pdo->query("DESCRIBE lessons");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $hasSpecificDate = false;
    foreach ($columns as $column) {
        if ($column['Field'] === 'specific_date') {
            $hasSpecificDate = true;
            break;
        }
    }
    
    if (!$hasSpecificDate) {
        // Add the specific_date column
        $pdo->exec("ALTER TABLE lessons ADD COLUMN specific_date DATE NULL COMMENT 'Voor specifieke datum lessen' AFTER day_of_week");
        $pdo->exec("ALTER TABLE lessons ADD INDEX idx_date (specific_date)");
        
        echo json_encode([
            'success' => true,
            'message' => 'specific_date column added successfully',
            'columns_before' => $columns
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'message' => 'specific_date column already exists',
            'columns' => $columns
        ]);
    }
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>