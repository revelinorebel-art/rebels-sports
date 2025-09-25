<?php
require_once 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

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
    
    // Get recent lessons
    $stmt = $pdo->query("SELECT * FROM lessons ORDER BY created_at DESC LIMIT 5");
    $lessons = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'has_specific_date_column' => $hasSpecificDate,
        'columns' => $columns,
        'lessons' => $lessons,
        'count' => count($lessons)
    ]);
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>