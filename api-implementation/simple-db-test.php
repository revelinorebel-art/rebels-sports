<?php
// Simple database structure test
require_once 'config.php';

echo "<h2>Database Structure Test</h2>";

try {
    // Check table structure
    echo "<h3>Table Structure:</h3>";
    $stmt = $pdo->query("DESCRIBE lessons");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "<pre>" . print_r($columns, true) . "</pre>";
    
    // Check raw data
    echo "<h3>Raw Lesson Data (last 3):</h3>";
    $stmt = $pdo->query("SELECT * FROM lessons ORDER BY created_at DESC LIMIT 3");
    $lessons = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "<pre>" . print_r($lessons, true) . "</pre>";
    
    // Check specific columns
    echo "<h3>Specific Date Column Check:</h3>";
    $stmt = $pdo->query("SELECT id, title, specific_date, day_of_week FROM lessons ORDER BY created_at DESC LIMIT 3");
    $specificData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "<pre>" . print_r($specificData, true) . "</pre>";
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>