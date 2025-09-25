<?php
require_once 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    // Check database structure
    $stmt = $pdo->query("DESCRIBE lessons");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get raw lesson data
    $stmt = $pdo->query("SELECT * FROM lessons ORDER BY created_at DESC LIMIT 3");
    $lessons = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'columns' => $columns,
        'raw_lessons' => $lessons,
        'column_names' => array_column($columns, 'Field')
    ]);
    
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>