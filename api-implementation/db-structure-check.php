<?php
require_once 'config.php';

header('Content-Type: text/html; charset=utf-8');

echo "<!DOCTYPE html><html><head><title>Database Structure Check</title></head><body>";
echo "<h1>REBELS SPORTS - Database Structure Check</h1>";

try {
    echo "<h2>1. Table Structure (DESCRIBE lessons):</h2>";
    $stmt = $pdo->query("DESCRIBE lessons");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "<table border='1' style='border-collapse: collapse;'>";
    echo "<tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
    foreach ($columns as $column) {
        echo "<tr>";
        echo "<td>" . htmlspecialchars($column['Field']) . "</td>";
        echo "<td>" . htmlspecialchars($column['Type']) . "</td>";
        echo "<td>" . htmlspecialchars($column['Null']) . "</td>";
        echo "<td>" . htmlspecialchars($column['Key']) . "</td>";
        echo "<td>" . htmlspecialchars($column['Default']) . "</td>";
        echo "<td>" . htmlspecialchars($column['Extra']) . "</td>";
        echo "</tr>";
    }
    echo "</table>";
    
    echo "<h2>2. Column Names:</h2>";
    $columnNames = array_column($columns, 'Field');
    echo "<ul>";
    foreach ($columnNames as $name) {
        echo "<li>" . htmlspecialchars($name) . "</li>";
    }
    echo "</ul>";
    
    echo "<h2>3. Specific Date Column Check:</h2>";
    if (in_array('specific_date', $columnNames)) {
        echo "<p style='color: green; font-weight: bold;'>✓ specific_date column EXISTS</p>";
    } else {
        echo "<p style='color: red; font-weight: bold;'>✗ specific_date column MISSING</p>";
    }
    
    echo "<h2>4. Raw Data (last 3 lessons):</h2>";
    $stmt = $pdo->query("SELECT * FROM lessons ORDER BY created_at DESC LIMIT 3");
    $lessons = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($lessons)) {
        echo "<p>No lessons found.</p>";
    } else {
        echo "<table border='1' style='border-collapse: collapse;'>";
        // Header
        echo "<tr>";
        foreach (array_keys($lessons[0]) as $key) {
            echo "<th>" . htmlspecialchars($key) . "</th>";
        }
        echo "</tr>";
        
        // Data
        foreach ($lessons as $lesson) {
            echo "<tr>";
            foreach ($lesson as $value) {
                echo "<td>" . htmlspecialchars($value ?? 'NULL') . "</td>";
            }
            echo "</tr>";
        }
        echo "</table>";
    }
    
    echo "<h2>5. Specific Date Values Check:</h2>";
    if (in_array('specific_date', $columnNames)) {
        $stmt = $pdo->query("SELECT id, title, specific_date, day_of_week FROM lessons ORDER BY created_at DESC LIMIT 5");
        $specificData = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "<table border='1' style='border-collapse: collapse;'>";
        echo "<tr><th>ID</th><th>Title</th><th>Specific Date</th><th>Day of Week</th></tr>";
        foreach ($specificData as $row) {
            echo "<tr>";
            echo "<td>" . htmlspecialchars($row['id']) . "</td>";
            echo "<td>" . htmlspecialchars($row['title']) . "</td>";
            echo "<td style='" . (empty($row['specific_date']) ? "color: red;" : "color: green;") . "'>" . 
                 htmlspecialchars($row['specific_date'] ?? 'NULL') . "</td>";
            echo "<td>" . htmlspecialchars($row['day_of_week'] ?? 'NULL') . "</td>";
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "<p style='color: red;'>Cannot check specific_date values - column does not exist!</p>";
    }
    
} catch (PDOException $e) {
    echo "<p style='color: red; font-weight: bold;'>Database Error: " . htmlspecialchars($e->getMessage()) . "</p>";
}

echo "<hr>";
echo "<p><small>Generated at: " . date('Y-m-d H:i:s') . "</small></p>";
echo "</body></html>";
?>