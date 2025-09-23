<?php
/**
 * REBELS SPORTS - Lessons API
 * Handles all lesson-related operations
 */

require_once 'config.php';

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
        // Haal alle lessen op, gesorteerd op datum en tijd
        $stmt = $pdo->query("
            SELECT 
                id,
                title,
                time,
                trainer,
                spots,
                day_of_week as day,
                specific_date as date,
                description,
                created_at,
                updated_at
            FROM lessons 
            ORDER BY specific_date, time
        ");
        
        $lessons = $stmt->fetchAll();
        
        // Converteer time format voor frontend compatibiliteit
        foreach ($lessons as &$lesson) {
            $lesson['time'] = substr($lesson['time'], 0, 5); // HH:MM format
            $lesson['day'] = $lesson['day'] !== null ? (int)$lesson['day'] : null; // Zorg voor integer of null
            $lesson['spots'] = (int)$lesson['spots'];
        }
        
        sendResponse($lessons);
        
    } catch (PDOException $e) {
        sendError('Fout bij ophalen lessen: ' . $e->getMessage(), 500);
    }
}

function handleCreateLesson($data) {
    global $pdo;
    
    // Valideer input (day is nu optioneel - alleen admin kan specifieke datum instellen)
    validateInput($data, ['title', 'time', 'trainer', 'spots']);
    
    try {
        // Genereer een unieke UUID voor de les
        $lessonId = generateUUID();
        
        $stmt = $pdo->prepare("
            INSERT INTO lessons (id, title, time, trainer, spots, day_of_week, specific_date, description) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $result = $stmt->execute([
            $lessonId,
            sanitizeInput($data['title']),
            $data['time'],
            sanitizeInput($data['trainer']),
            (int)$data['spots'],
            isset($data['day']) ? (int)$data['day'] : null,
            isset($data['date']) && !empty($data['date']) ? $data['date'] : null,
            isset($data['description']) ? sanitizeInput($data['description']) : ''
        ]);
        
        if ($result) {
            sendResponse(['success' => true, 'id' => $lessonId, 'message' => 'Les succesvol toegevoegd']);
        } else {
            sendError('Fout bij toevoegen les', 500);
        }
        
    } catch (PDOException $e) {
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
            isset($data['day']) ? (int)$data['day'] : null,
            isset($data['date']) && !empty($data['date']) ? $data['date'] : null,
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