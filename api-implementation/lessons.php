<?php
/**
 * REBELS SPORTS - Lessons API
 * Handles all lesson-related operations
 */

require_once 'config.php';

// Quick debug test
if (isset($_GET['quicktest'])) {
    header('Content-Type: application/json');
    echo json_encode([
        'message' => 'Quick test working',
        'get_params' => $_GET,
        'request_uri' => $_SERVER['REQUEST_URI'] ?? 'not set',
        'query_string' => $_SERVER['QUERY_STRING'] ?? 'not set'
    ]);
    exit();
}

// Simple HTML debug mode - MUST be first
if (isset($_GET['htmldebug']) || isset($_GET['dbtest'])) {
    // Clear any output buffers
    while (ob_get_level()) {
        ob_end_clean();
    }
    
    // Set HTML content type
    header('Content-Type: text/html; charset=utf-8');
    
    echo "<!DOCTYPE html><html><head><title>Database Debug</title></head><body>";
    echo "<h2>Database Structure Debug</h2>";
    echo "<p>Debug parameters: " . print_r($_GET, true) . "</p>";
    
    try {
        echo "<h3>Table Structure:</h3>";
        $stmt = $pdo->query("DESCRIBE lessons");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo "<pre>" . print_r($columns, true) . "</pre>";
        
        echo "<h3>Raw Data (last 3):</h3>";
        $stmt = $pdo->query("SELECT * FROM lessons ORDER BY created_at DESC LIMIT 3");
        $lessons = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo "<pre>" . print_r($lessons, true) . "</pre>";
        
        echo "<h3>Column Names:</h3>";
        $columnNames = array_column($columns, 'Field');
        echo "<pre>" . print_r($columnNames, true) . "</pre>";
        
        echo "<h3>Specific Date Check:</h3>";
        if (in_array('specific_date', $columnNames)) {
            echo "<p style='color: green;'>✓ specific_date column EXISTS</p>";
        } else {
            echo "<p style='color: red;'>✗ specific_date column MISSING</p>";
        }
        
    } catch (PDOException $e) {
        echo "<p style='color: red;'>Error: " . $e->getMessage() . "</p>";
    }
    
    echo "</body></html>";
    die(); // Force exit
}

// Set CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Debug endpoint to check database structure and content
if (isset($_GET['debug'])) {
    header('Content-Type: application/json');
    try {
        if ($_GET['debug'] === 'structure') {
            $stmt = $pdo->query("DESCRIBE lessons");
            $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['columns' => $columns]);
            exit;
        } elseif ($_GET['debug'] === 'raw') {
            $stmt = $pdo->query("SELECT * FROM lessons ORDER BY created_at DESC LIMIT 3");
            $lessons = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['raw_lessons' => $lessons]);
            exit;
        } elseif ($_GET['debug'] === 'sql') {
            $stmt = $pdo->query("SELECT id, title, specific_date, day_of_week FROM lessons ORDER BY created_at DESC LIMIT 3");
            $lessons = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['sql_result' => $lessons]);
            exit;
        }
    } catch (PDOException $e) {
        echo json_encode(['error' => $e->getMessage()]);
        exit;
    }
}

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch($method) {
    case 'GET':
        handleGetLessons();
        break;
        
    case 'POST':
        handleCreateLesson($input);
        break;
        
    case 'PUT':
        handleUpdateLesson($input);
        break;
        
    case 'DELETE':
        handleDeleteLesson();
        break;
        
    default:
        sendError('Method not allowed', 405);
}

function handleGetLessons() {
    global $pdo;
    
    try {
        // Check database structure first
        $stmt = $pdo->query("DESCRIBE lessons");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $columnNames = array_column($columns, 'Field');
        
        // Check if specific_date column exists
        if (!in_array('specific_date', $columnNames)) {
            $pdo->exec("ALTER TABLE lessons ADD COLUMN specific_date DATE NULL COMMENT 'Voor specifieke datum lessen'");
            error_log("Added specific_date column to lessons table");
        }
        
        $stmt = $pdo->prepare("SELECT * FROM lessons ORDER BY specific_date ASC, time ASC");
        $stmt->execute();
        $lessons = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Convert time format for frontend and ensure proper data types
        foreach ($lessons as &$lesson) {
            if ($lesson['time']) {
                $lesson['time'] = date('H:i', strtotime($lesson['time']));
            }
            
            // Ensure numeric fields are properly typed
            $lesson['spots'] = (int)$lesson['spots'];
            $lesson['day_of_week'] = $lesson['day_of_week'] ? (int)$lesson['day_of_week'] : null;
            
            // Ensure description is not null
            $lesson['description'] = $lesson['description'] ?: '';
        }
        
        error_log("GET LESSONS DEBUG: Found " . count($lessons) . " lessons");
        error_log("GET LESSONS DEBUG: Lessons data: " . json_encode($lessons));
        
        sendResponse([
            'success' => true, 
            'data' => $lessons,  // Use 'data' for consistency with frontend expectations
            'lessons' => $lessons, // Keep 'lessons' for backward compatibility
            'count' => count($lessons),
            'debug' => [
                'table_structure' => $columnNames,
                'specific_date_column_exists' => in_array('specific_date', $columnNames)
            ]
        ]);
        
    } catch (PDOException $e) {
        error_log("Database error in handleGetLessons: " . $e->getMessage());
        sendError('Fout bij ophalen lessen: ' . $e->getMessage(), 500);
    }
}

function handleCreateLesson($data) {
    global $pdo;
    
    // Debug logging
    error_log("CREATE LESSON DEBUG: Received data: " . json_encode($data));
    
    // Valideer input (day is nu optioneel - alleen admin kan specifieke datum instellen)
    validateInput($data, ['title', 'time', 'trainer', 'spots']);
    
    try {
        // Check database structure first
        $stmt = $pdo->query("DESCRIBE lessons");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $columnNames = array_column($columns, 'Field');
        error_log("Current table columns: " . json_encode($columnNames));
        
        // Check if specific_date column exists
        if (!in_array('specific_date', $columnNames)) {
            $pdo->exec("ALTER TABLE lessons ADD COLUMN specific_date DATE NULL COMMENT 'Voor specifieke datum lessen'");
            error_log("Added specific_date column to lessons table");
        }
        
        $dayOfWeek = isset($data['day_of_week']) ? (int)$data['day_of_week'] : null;
        $specificDate = isset($data['specific_date']) && !empty($data['specific_date']) ? $data['specific_date'] : null;
        
        error_log("CREATE LESSON DEBUG: day_of_week = " . var_export($dayOfWeek, true));
        error_log("CREATE LESSON DEBUG: specific_date = " . var_export($specificDate, true));
        
        // Try auto-increment approach first (most common case)
        try {
            $stmt = $pdo->prepare("
                INSERT INTO lessons (title, time, trainer, spots, day_of_week, specific_date, description) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            
            $params = [
                sanitizeInput($data['title']),
                $data['time'],
                sanitizeInput($data['trainer']),
                (int)$data['spots'],
                $dayOfWeek,
                $specificDate,
                isset($data['description']) ? sanitizeInput($data['description']) : ''
            ];
            
            error_log("Trying auto-increment INSERT with params: " . json_encode($params));
            $result = $stmt->execute($params);
            $lessonId = $pdo->lastInsertId();
            
            if ($result && $lessonId) {
                error_log("Auto-increment INSERT successful, ID: " . $lessonId);
                
                // Verify what was actually inserted
                $verifyStmt = $pdo->prepare("SELECT id, title, specific_date, day_of_week FROM lessons WHERE id = ?");
                $verifyStmt->execute([$lessonId]);
                $insertedLesson = $verifyStmt->fetch(PDO::FETCH_ASSOC);
                error_log("Inserted lesson verification: " . json_encode($insertedLesson));
                
                sendResponse([
                    'success' => true, 
                    'id' => $lessonId, 
                    'message' => 'Les succesvol toegevoegd',
                    'debug_inserted' => $insertedLesson,
                    'debug_id_type' => 'auto_increment'
                ]);
                return;
            }
        } catch (PDOException $autoIncrementError) {
            error_log("Auto-increment failed: " . $autoIncrementError->getMessage());
            
            // If auto-increment fails, try UUID approach
            try {
                $lessonId = generateUUID();
                
                $stmt = $pdo->prepare("
                    INSERT INTO lessons (id, title, time, trainer, spots, day_of_week, specific_date, description) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ");
                
                $params = [
                    $lessonId,
                    sanitizeInput($data['title']),
                    $data['time'],
                    sanitizeInput($data['trainer']),
                    (int)$data['spots'],
                    $dayOfWeek,
                    $specificDate,
                    isset($data['description']) ? sanitizeInput($data['description']) : ''
                ];
                
                error_log("Trying UUID INSERT with params: " . json_encode($params));
                $result = $stmt->execute($params);
                
                if ($result) {
                    error_log("UUID INSERT successful, ID: " . $lessonId);
                    
                    // Verify what was actually inserted
                    $verifyStmt = $pdo->prepare("SELECT id, title, specific_date, day_of_week FROM lessons WHERE id = ?");
                    $verifyStmt->execute([$lessonId]);
                    $insertedLesson = $verifyStmt->fetch(PDO::FETCH_ASSOC);
                    error_log("Inserted lesson verification: " . json_encode($insertedLesson));
                    
                    sendResponse([
                        'success' => true, 
                        'id' => $lessonId, 
                        'message' => 'Les succesvol toegevoegd',
                        'debug_inserted' => $insertedLesson,
                        'debug_id_type' => 'uuid'
                    ]);
                    return;
                }
            } catch (PDOException $uuidError) {
                error_log("UUID INSERT also failed: " . $uuidError->getMessage());
                throw $uuidError; // Re-throw to be caught by outer catch
            }
        }
        
        // If we get here, both methods failed
        sendError('Fout bij toevoegen les', 500);
        
    } catch (PDOException $e) {
        error_log("Database error in handleCreateLesson: " . $e->getMessage());
        if ($e->getCode() == 23000) { // Duplicate entry
            sendError('Les met dit ID bestaat al', 409);
        } else {
            sendError('Database fout: ' . $e->getMessage(), 500);
        }
    }
}

function handleUpdateLesson($data) {
    global $pdo;
    
    // Valideer input (day is optioneel)
    validateInput($data, ['id', 'title', 'time', 'trainer', 'spots']);
    
    try {
        $stmt = $pdo->prepare("
            UPDATE lessons 
            SET title = ?, time = ?, trainer = ?, spots = ?, day_of_week = ?, specific_date = ?, description = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ");
        
        $result = $stmt->execute([
            sanitizeInput($data['title']),
            $data['time'],
            sanitizeInput($data['trainer']),
            (int)$data['spots'],
            isset($data['day_of_week']) ? (int)$data['day_of_week'] : null,
            isset($data['specific_date']) && !empty($data['specific_date']) ? $data['specific_date'] : null,
            isset($data['description']) ? sanitizeInput($data['description']) : '',
            sanitizeInput($data['id'])
        ]);
        
        if ($stmt->rowCount() > 0) {
            sendResponse(['success' => true, 'message' => 'Les succesvol bijgewerkt']);
        } else {
            sendError('Les niet gevonden of geen wijzigingen', 404);
        }
        
    } catch (PDOException $e) {
        sendError('Fout bij bijwerken les: ' . $e->getMessage(), 500);
    }
}

function handleDeleteLesson() {
    global $pdo;
    
    $id = isset($_GET['id']) ? sanitizeInput($_GET['id']) : null;
    
    if (!$id) {
        sendError('Les ID is verplicht', 400);
    }
    
    try {
        // Check eerst of er reserveringen zijn
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM reservations WHERE lesson_id = ?");
        $stmt->execute([$id]);
        $reservationCount = $stmt->fetch()['count'];
        
        if ($reservationCount > 0) {
            sendError("Kan les niet verwijderen: er zijn nog $reservationCount reserveringen", 409);
        }
        
        // Verwijder de les
        $stmt = $pdo->prepare("DELETE FROM lessons WHERE id = ?");
        $result = $stmt->execute([$id]);
        
        if ($stmt->rowCount() > 0) {
            sendResponse(['success' => true, 'message' => 'Les succesvol verwijderd']);
        } else {
            sendError('Les niet gevonden', 404);
        }
        
    } catch (PDOException $e) {
        sendError('Fout bij verwijderen les: ' . $e->getMessage(), 500);
    }
}
?>