<?php
require_once 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    echo "=== RESERVATIONS TABLE DEBUG ===\n\n";
    
    // Check if reservations table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'reservations'");
    $tableExists = $stmt->fetch();
    
    if (!$tableExists) {
        echo "ERROR: reservations table does not exist!\n";
        exit;
    }
    
    echo "✓ reservations table exists\n\n";
    
    // Get table structure
    echo "=== TABLE STRUCTURE ===\n";
    $stmt = $pdo->query("DESCRIBE reservations");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($columns as $column) {
        echo "Column: " . $column['Field'] . " | Type: " . $column['Type'] . " | Null: " . $column['Null'] . "\n";
    }
    
    echo "\n=== COLUMN NAMES ===\n";
    $columnNames = array_column($columns, 'Field');
    foreach ($columnNames as $name) {
        echo "- " . $name . "\n";
    }
    
    // Check if lesson_date column exists
    echo "\n=== LESSON_DATE CHECK ===\n";
    if (in_array('lesson_date', $columnNames)) {
        echo "✓ lesson_date column EXISTS\n";
    } else {
        echo "✗ lesson_date column MISSING\n";
        echo "Available date-related columns:\n";
        foreach ($columnNames as $name) {
            if (stripos($name, 'date') !== false || stripos($name, 'time') !== false) {
                echo "  - " . $name . "\n";
            }
        }
    }
    
    // Test the problematic query
    echo "\n=== TESTING PROBLEMATIC QUERY ===\n";
    try {
        $stmt = $pdo->query("
            SELECT 
                r.*,
                l.title as lesson_title,
                l.time as lesson_time,
                l.trainer as lesson_trainer,
                l.day_of_week
            FROM reservations r
            JOIN lessons l ON r.lesson_id = l.id
            WHERE 1=1
            ORDER BY r.lesson_date DESC, l.time
            LIMIT 1
        ");
        $result = $stmt->fetch();
        echo "✓ Query executed successfully\n";
        if ($result) {
            echo "Sample result: " . json_encode($result) . "\n";
        } else {
            echo "No results found (table might be empty)\n";
        }
    } catch (PDOException $e) {
        echo "✗ Query failed: " . $e->getMessage() . "\n";
    }
    
    // Count total reservations
    echo "\n=== TABLE STATS ===\n";
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM reservations");
    $count = $stmt->fetch()['total'];
    echo "Total reservations: " . $count . "\n";
    
} catch (PDOException $e) {
    echo "Database error: " . $e->getMessage() . "\n";
} catch (Exception $e) {
    echo "General error: " . $e->getMessage() . "\n";
}
?>