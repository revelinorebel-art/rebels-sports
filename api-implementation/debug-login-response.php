<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Test what admin.php returns when we try to login
$adminUrl = 'https://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['REQUEST_URI']) . '/admin.php';

// Test data
$loginData = [
    'action' => 'login',
    'username' => 'rebeladmin',
    'password' => 'admin123'
];

// Initialize cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $adminUrl);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($loginData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);

// Execute request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$error = curl_error($ch);
curl_close($ch);

// Split headers and body
$headers = substr($response, 0, $headerSize);
$body = substr($response, $headerSize);

// Try to detect if it's HTML or JSON
$isHtml = (stripos($body, '<!DOCTYPE') !== false || stripos($body, '<html') !== false);
$isJson = false;
$jsonData = null;

if (!$isHtml) {
    $jsonData = json_decode($body, true);
    $isJson = (json_last_error() === JSON_ERROR_NONE);
}

echo json_encode([
    'debug_info' => [
        'admin_url' => $adminUrl,
        'http_code' => $httpCode,
        'curl_error' => $error,
        'response_type' => $isHtml ? 'HTML' : ($isJson ? 'JSON' : 'UNKNOWN'),
        'body_length' => strlen($body),
        'body_preview' => substr($body, 0, 500),
        'headers' => $headers
    ],
    'login_test' => [
        'username' => 'rebeladmin',
        'password' => 'admin123',
        'is_html_response' => $isHtml,
        'is_json_response' => $isJson,
        'json_data' => $jsonData
    ],
    'analysis' => [
        'problem' => $isHtml ? 'admin.php is returning HTML instead of JSON' : 'Response looks correct',
        'likely_cause' => $isHtml ? 'PHP error, missing headers, or wrong endpoint' : 'Login credentials or logic issue',
        'next_steps' => $isHtml ? 
            ['Check admin.php for PHP errors', 'Verify Content-Type headers', 'Check if admin.php exists'] :
            ['Verify login credentials', 'Check database connection', 'Review login logic']
    ]
]);
?>