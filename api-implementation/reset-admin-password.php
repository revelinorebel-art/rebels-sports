<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'config.php';

// Default new password - change this to whatever you want
$newPassword = 'admin123';  // You can change this to any password you prefer
$hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

try {
    // Get the first admin user (usually there's only one)
    $stmt = $pdo->prepare("SELECT id, username, email FROM admin_users ORDER BY created_at ASC LIMIT 1");
    $stmt->execute();
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$admin) {
        echo json_encode([
            'success' => false,
            'message' => 'Geen admin gebruiker gevonden om het wachtwoord te resetten.'
        ]);
        exit;
    }
    
    // Update the password_hash
    $updateStmt = $pdo->prepare("UPDATE admin_users SET password_hash = ? WHERE id = ?");
    $result = $updateStmt->execute([$hashedPassword, $admin['id']]);
    
    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => 'Wachtwoord succesvol gereset!',
            'admin_info' => [
                'username' => $admin['username'],
                'email' => $admin['email'],
                'new_password' => $newPassword
            ],
            'instructions' => [
                '1. Gebruik de username: ' . $admin['username'],
                '2. Gebruik het nieuwe wachtwoord: ' . $newPassword,
                '3. Log in op je admin panel',
                '4. Verander het wachtwoord naar iets dat je onthoudt'
            ],
            'security_note' => 'Verander dit wachtwoord zo snel mogelijk na het inloggen!'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Er ging iets mis bij het resetten van het wachtwoord.'
        ]);
    }
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage(),
        'code' => $e->getCode()
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'General error: ' . $e->getMessage()
    ]);
}
?>