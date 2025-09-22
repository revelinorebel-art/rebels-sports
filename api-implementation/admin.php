<?php
/**
 * REBELS SPORTS - Admin API
 * Handles admin authentication and session management
 */

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch($method) {
    case 'POST':
        $action = isset($_GET['action']) ? $_GET['action'] : 'login';
        
        if ($action === 'login') {
            handleLogin($input);
        } elseif ($action === 'logout') {
            handleLogout();
        } elseif ($action === 'verify') {
            handleVerifySession();
        } else {
            sendError('Onbekende actie', 400);
        }
        break;
        
    case 'GET':
        handleVerifySession();
        break;
        
    default:
        sendError('Method not allowed', 405);
}

function handleLogin($data) {
    global $pdo;
    
    // Valideer input
    validateInput($data, ['username', 'password']);
    
    $username = sanitizeInput($data['username']);
    $password = $data['password'];
    
    try {
        // Haal admin gebruiker op
        $stmt = $pdo->prepare("SELECT * FROM admin_users WHERE username = ? AND is_active = 1");
        $stmt->execute([$username]);
        $admin = $stmt->fetch();
        
        if (!$admin) {
            // Voeg kleine vertraging toe tegen brute force
            sleep(1);
            sendError('Ongeldige inloggegevens', 401);
        }
        
        // Verificeer wachtwoord
        if (!password_verify($password, $admin['password_hash'])) {
            // Update failed login attempts
            $stmt = $pdo->prepare("
                UPDATE admin_users 
                SET failed_login_attempts = failed_login_attempts + 1, last_failed_login = NOW() 
                WHERE id = ?
            ");
            $stmt->execute([$admin['id']]);
            
            sleep(1);
            sendError('Ongeldige inloggegevens', 401);
        }
        
        // Check of account niet geblokkeerd is (na 5 mislukte pogingen)
        if ($admin['failed_login_attempts'] >= 5) {
            $lastFailed = new DateTime($admin['last_failed_login']);
            $now = new DateTime();
            $diff = $now->diff($lastFailed);
            
            // Blokkeer voor 15 minuten na 5 mislukte pogingen
            if ($diff->i < 15) {
                sendError('Account tijdelijk geblokkeerd. Probeer over 15 minuten opnieuw.', 423);
            }
        }
        
        // Maak nieuwe sessie
        $sessionToken = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', strtotime('+24 hours'));
        
        $stmt = $pdo->prepare("
            INSERT INTO admin_sessions (admin_id, session_token, expires_at) 
            VALUES (?, ?, ?)
        ");
        $stmt->execute([$admin['id'], $sessionToken, $expiresAt]);
        
        // Reset failed login attempts
        $stmt = $pdo->prepare("
            UPDATE admin_users 
            SET failed_login_attempts = 0, last_login = NOW() 
            WHERE id = ?
        ");
        $stmt->execute([$admin['id']]);
        
        // Ruim oude sessies op
        $stmt = $pdo->prepare("DELETE FROM admin_sessions WHERE admin_id = ? AND expires_at < NOW()");
        $stmt->execute([$admin['id']]);
        
        sendResponse([
            'success' => true,
            'message' => 'Succesvol ingelogd',
            'session_token' => $sessionToken,
            'expires_at' => $expiresAt,
            'admin' => [
                'id' => $admin['id'],
                'username' => $admin['username'],
                'email' => $admin['email'],
                'role' => $admin['role']
            ]
        ]);
        
    } catch (PDOException $e) {
        sendError('Database fout: ' . $e->getMessage(), 500);
    }
}

function handleLogout() {
    $sessionToken = getSessionToken();
    
    if (!$sessionToken) {
        sendError('Geen sessie gevonden', 400);
    }
    
    global $pdo;
    
    try {
        $stmt = $pdo->prepare("DELETE FROM admin_sessions WHERE session_token = ?");
        $stmt->execute([$sessionToken]);
        
        sendResponse([
            'success' => true,
            'message' => 'Succesvol uitgelogd'
        ]);
        
    } catch (PDOException $e) {
        sendError('Database fout: ' . $e->getMessage(), 500);
    }
}

function handleVerifySession() {
    $sessionToken = getSessionToken();
    
    if (!$sessionToken) {
        sendError('Geen sessie token', 401);
    }
    
    global $pdo;
    
    try {
        $stmt = $pdo->prepare("
            SELECT s.*, a.username, a.email, a.role 
            FROM admin_sessions s
            JOIN admin_users a ON s.admin_id = a.id
            WHERE s.session_token = ? AND s.expires_at > NOW() AND a.is_active = 1
        ");
        $stmt->execute([$sessionToken]);
        $session = $stmt->fetch();
        
        if (!$session) {
            sendError('Ongeldige of verlopen sessie', 401);
        }
        
        // Verleng sessie als deze binnen 2 uur verloopt
        $expiresAt = new DateTime($session['expires_at']);
        $now = new DateTime();
        $diff = $expiresAt->diff($now);
        
        if ($diff->h < 2) {
            $newExpiresAt = date('Y-m-d H:i:s', strtotime('+24 hours'));
            $stmt = $pdo->prepare("UPDATE admin_sessions SET expires_at = ? WHERE session_token = ?");
            $stmt->execute([$newExpiresAt, $sessionToken]);
            $session['expires_at'] = $newExpiresAt;
        }
        
        sendResponse([
            'valid' => true,
            'admin' => [
                'id' => $session['admin_id'],
                'username' => $session['username'],
                'email' => $session['email'],
                'role' => $session['role']
            ],
            'expires_at' => $session['expires_at']
        ]);
        
    } catch (PDOException $e) {
        sendError('Database fout: ' . $e->getMessage(), 500);
    }
}

function getSessionToken() {
    // Probeer uit Authorization header
    $headers = getallheaders();
    if (isset($headers['Authorization'])) {
        $auth = $headers['Authorization'];
        if (strpos($auth, 'Bearer ') === 0) {
            return substr($auth, 7);
        }
    }
    
    // Probeer uit POST data
    $input = json_decode(file_get_contents('php://input'), true);
    if (isset($input['session_token'])) {
        return $input['session_token'];
    }
    
    // Probeer uit GET parameter
    if (isset($_GET['session_token'])) {
        return $_GET['session_token'];
    }
    
    return null;
}

// Middleware functie voor andere API endpoints
function requireAdminAuth() {
    $sessionToken = getSessionToken();
    
    if (!$sessionToken) {
        sendError('Authenticatie vereist', 401);
    }
    
    global $pdo;
    
    try {
        $stmt = $pdo->prepare("
            SELECT s.admin_id, a.role 
            FROM admin_sessions s
            JOIN admin_users a ON s.admin_id = a.id
            WHERE s.session_token = ? AND s.expires_at > NOW() AND a.is_active = 1
        ");
        $stmt->execute([$sessionToken]);
        $session = $stmt->fetch();
        
        if (!$session) {
            sendError('Ongeldige of verlopen sessie', 401);
        }
        
        return $session;
        
    } catch (PDOException $e) {
        sendError('Database fout: ' . $e->getMessage(), 500);
    }
}

// Extra functie: dashboard statistieken
if (isset($_GET['dashboard']) && $_GET['dashboard'] === 'true') {
    handleDashboard();
}

function handleDashboard() {
    // Verificeer admin auth
    $session = requireAdminAuth();
    
    global $pdo;
    
    try {
        // Haal verschillende statistieken op
        
        // Totaal aantal lessen
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM lessons");
        $totalLessons = $stmt->fetch()['total'];
        
        // Totaal aantal reserveringen deze maand
        $stmt = $pdo->query("
            SELECT COUNT(*) as total 
            FROM reservations 
            WHERE MONTH(lesson_date) = MONTH(CURRENT_DATE()) 
            AND YEAR(lesson_date) = YEAR(CURRENT_DATE())
            AND status = 'confirmed'
        ");
        $reservationsThisMonth = $stmt->fetch()['total'];
        
        // Totaal aantal services
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM services WHERE is_active = 1");
        $totalServices = $stmt->fetch()['total'];
        
        // Recente reserveringen (laatste 10)
        $stmt = $pdo->query("
            SELECT 
                r.participant_name,
                r.participant_email,
                r.lesson_date,
                r.created_at,
                l.title as lesson_title,
                l.time as lesson_time
            FROM reservations r
            JOIN lessons l ON r.lesson_id = l.id
            WHERE r.status = 'confirmed'
            ORDER BY r.created_at DESC
            LIMIT 10
        ");
        $recentReservations = $stmt->fetchAll();
        
        sendResponse([
            'stats' => [
                'total_lessons' => (int)$totalLessons,
                'reservations_this_month' => (int)$reservationsThisMonth,
                'total_services' => (int)$totalServices
            ],
            'recent_reservations' => $recentReservations
        ]);
        
    } catch (PDOException $e) {
        sendError('Fout bij ophalen dashboard data: ' . $e->getMessage(), 500);
    }
}
?>