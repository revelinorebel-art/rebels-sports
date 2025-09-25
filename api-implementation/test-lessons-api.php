<?php
// Test script to check lessons API endpoint
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

echo "=== LESSONS API TEST ===\n\n";

// Test direct database connection
require_once 'config.php';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ Database connection successful\n\n";
    
    // Test lessons table
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM lessons");
    $count = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "📊 Total lessons in database: " . $count['count'] . "\n\n";
    
    // Get all lessons
    $stmt = $pdo->query("SELECT * FROM lessons ORDER BY specific_date, time");
    $lessons = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "📋 All lessons:\n";
    foreach ($lessons as $lesson) {
        echo "- ID: {$lesson['id']}, Date: {$lesson['date']}, Time: {$lesson['time']}, Title: {$lesson['title']}, Trainer: {$lesson['trainer']}\n";
    }
    
    echo "\n=== TESTING API ENDPOINT ===\n\n";
    
    // Test the actual API endpoint
    $api_url = 'https://red-seal-316406.hostingersite.com/api-implementation/lessons.php';
    
    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => 'Content-Type: application/json'
        ]
    ]);
    
    $response = file_get_contents($api_url, false, $context);
    
    if ($response === false) {
        echo "❌ API endpoint failed\n";
    } else {
        echo "✅ API endpoint response:\n";
        echo $response . "\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>