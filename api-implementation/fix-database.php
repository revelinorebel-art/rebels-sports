<?php
require_once 'config.php';

try {
    // Check database structure
    $stmt = $pdo->query("DESCRIBE lessons");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Check if specific_date column exists
    $hasSpecificDate = false;
    foreach ($columns as $column) {
        if ($column['Field'] === 'specific_date') {
            $hasSpecificDate = true;
            break;
        }
    }
    
    $result = [
        'has_specific_date_column' => $hasSpecificDate,
        'columns' => array_column($columns, 'Field')
    ];
    
    // If specific_date column doesn't exist, add it
    if (!$hasSpecificDate) {
        try {
            $pdo->exec("ALTER TABLE lessons ADD COLUMN specific_date DATE NULL COMMENT 'Voor specifieke datum lessen'");
            $result['column_added'] = true;
            $result['message'] = 'specific_date column added successfully';
        } catch (PDOException $e) {
            $result['column_added'] = false;
            $result['error'] = $e->getMessage();
        }
    }
    
    sendResponse($result);
    
} catch (PDOException $e) {
    sendError('Database error: ' . $e->getMessage(), 500);
}
?>