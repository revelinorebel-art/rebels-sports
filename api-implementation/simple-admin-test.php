<?php
// Simple test to see what admin.php returns
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "=== TESTING ADMIN.PHP DIRECTLY ===\n\n";

// Test 1: Check if admin.php exists and is readable
$adminFile = __DIR__ . '/admin.php';
echo "1. Admin.php file check:\n";
echo "   File exists: " . (file_exists($adminFile) ? 'YES' : 'NO') . "\n";
echo "   File readable: " . (is_readable($adminFile) ? 'YES' : 'NO') . "\n\n";

// Test 2: Try to include and capture output
echo "2. Testing admin.php output:\n";

// Capture what admin.php outputs
ob_start();

// Simulate POST request
$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['CONTENT_TYPE'] = 'application/json';

// Simulate login data
$loginData = json_encode([
    'username' => 'rebeladmin',
    'password' => 'admin123'
]);

// Mock php://input
$temp = tmpfile();
fwrite($temp, $loginData);
rewind($temp);

// Try to include admin.php
try {
    include $adminFile;
} catch (Exception $e) {
    echo "   ERROR: " . $e->getMessage() . "\n";
} catch (Error $e) {
    echo "   FATAL ERROR: " . $e->getMessage() . "\n";
}

$output = ob_get_clean();

echo "   Output length: " . strlen($output) . " characters\n";
echo "   First 200 characters:\n";
echo "   " . substr($output, 0, 200) . "\n\n";

// Test 3: Check if it's HTML or JSON
$isHtml = (stripos($output, '<!DOCTYPE') !== false || stripos($output, '<html') !== false);
$isJson = false;
$jsonData = null;

if (!$isHtml && !empty($output)) {
    $jsonData = json_decode($output, true);
    $isJson = (json_last_error() === JSON_ERROR_NONE);
}

echo "3. Output analysis:\n";
echo "   Is HTML: " . ($isHtml ? 'YES' : 'NO') . "\n";
echo "   Is JSON: " . ($isJson ? 'YES' : 'NO') . "\n";
echo "   JSON decode error: " . json_last_error_msg() . "\n\n";

if ($jsonData) {
    echo "4. JSON content:\n";
    echo "   " . json_encode($jsonData, JSON_PRETTY_PRINT) . "\n";
} else {
    echo "4. Raw output:\n";
    echo "   " . $output . "\n";
}

fclose($temp);
?>