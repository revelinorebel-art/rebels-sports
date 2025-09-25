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

try {
    // Get all admin users from the database
    $stmt = $pdo->prepare("SELECT id, username, email, created_at FROM admin_users ORDER BY created_at ASC");
    $stmt->execute();
    $admins = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($admins)) {
        echo json_encode([
            'success' => false,
            'message' => 'Geen admin gebruikers gevonden in de database.',
            'suggestion' => 'Er moet een admin gebruiker aangemaakt worden.'
        ]);
        exit;
    }
    
    // For security, we'll show usernames but not passwords
    // The user will need to reset the password if they don't remember it
    echo json_encode([
        'success' => true,
        'message' => 'Admin gebruikers gevonden',
        'admin_users' => $admins,
        'note' => 'Wachtwoorden worden niet getoond om veiligheidsredenen. Als je het wachtwoord niet weet, kunnen we het resetten.',
        'instructions' => [
            '1. Probeer in te loggen met een van de usernames hierboven',
            '2. Als je het wachtwoord niet weet, laat het me weten en ik maak een reset script'
        ]
    ]);
    
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