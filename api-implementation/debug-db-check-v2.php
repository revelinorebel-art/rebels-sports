<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once 'config.php';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Get table structure
    $stmt = $pdo->query("DESCRIBE lessons");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get raw lesson data
    $stmt = $pdo->query("SELECT * FROM lessons ORDER BY created_at DESC LIMIT 5");
    $lessons = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Check if specific_date column exists
    $columnNames = array_column($columns, 'Field');
    $hasSpecificDate = in_array('specific_date', $columnNames);
    
    $response = [
        'timestamp' => date('Y-m-d H:i:s'),
        'table_structure' => $columns,
        'column_names' => $columnNames,
        'has_specific_date_column' => $hasSpecificDate,
        'raw_lessons' => $lessons,
        'lesson_count' => count($lessons)
    ];
    
    echo json_encode($response, JSON_PRETTY_PRINT);
    
} catch (PDOException $e) {
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>