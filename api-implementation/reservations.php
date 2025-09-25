<?php
/**
 * REBELS SPORTS - Reservations API
 * Handles all reservation-related operations
 */

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch($method) {
    case 'GET':
        handleGetReservations();
        break;
        
    case 'POST':
        handleCreateReservation($input);
        break;
        
    case 'DELETE':
        handleDeleteReservation();
        break;
        
    default:
        sendError('Method not allowed', 405);
}

function handleGetReservations() {
    global $pdo;
    
    $lessonId = isset($_GET['lesson_id']) ? sanitizeInput($_GET['lesson_id']) : null;
    $date = isset($_GET['date']) ? sanitizeInput($_GET['date']) : null;
    
    try {
        // First, check if reservations table exists and has the right structure
        $stmt = $pdo->query("DESCRIBE reservations");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $columnNames = array_column($columns, 'Field');
        
        // Log available columns for debugging
        error_log("Available columns in reservations table: " . implode(', ', $columnNames));
        
        if ($lessonId && $date) {
            // Haal reserveringen voor specifieke les en datum
            $stmt = $pdo->prepare("
                SELECT 
                    r.*,
                    l.title as lesson_title,
                    l.time as lesson_time,
                    l.trainer as lesson_trainer
                FROM reservations r
                JOIN lessons l ON r.lesson_id = l.id
                WHERE r.lesson_id = ? AND r.lesson_date = ?
                ORDER BY r.created_at
            ");
            $stmt->execute([$lessonId, $date]);
            $reservations = $stmt->fetchAll();
            
            // Tel ook het aantal reserveringen
            $stmt = $pdo->prepare("
                SELECT COUNT(*) as count 
                FROM reservations 
                WHERE lesson_id = ? AND lesson_date = ?
            ");
            $stmt->execute([$lessonId, $date]);
            $count = $stmt->fetch()['count'];
            
            sendResponse($reservations);
            
        } else {
            // Check if lesson_date column exists before using it in ORDER BY
            if (in_array('lesson_date', $columnNames)) {
                // Haal alle reserveringen (voor admin overzicht) - with lesson_date
                $stmt = $pdo->query("
                    SELECT 
                        r.*,
                        l.title as lesson_title,
                        l.time as lesson_time,
                        l.trainer as lesson_trainer,
                        l.day_of_week
                    FROM reservations r
                    JOIN lessons l ON r.lesson_id = l.id
                    ORDER BY r.lesson_date DESC, l.time
                ");
            } else {
                // Fallback: order by created_at if lesson_date doesn't exist
                error_log("lesson_date column not found, using created_at for ordering");
                $stmt = $pdo->query("
                    SELECT 
                        r.*,
                        l.title as lesson_title,
                        l.time as lesson_time,
                        l.trainer as lesson_trainer,
                        l.day_of_week
                    FROM reservations r
                    JOIN lessons l ON r.lesson_id = l.id
                    ORDER BY r.created_at DESC, l.time
                ");
            }
            
            $reservations = $stmt->fetchAll();
            
            sendResponse($reservations);
        }
        
    } catch (PDOException $e) {
        error_log("Database error in handleGetReservations: " . $e->getMessage());
        sendError('Fout bij ophalen reserveringen: ' . $e->getMessage(), 500);
    }
}

function handleCreateReservation($data) {
    global $pdo;
    
    // Valideer input
    validateInput($data, ['lesson_id', 'lesson_date', 'participant_name', 'participant_email']);
    
    try {
        // Check of de les bestaat
        $stmt = $pdo->prepare("SELECT spots FROM lessons WHERE id = ?");
        $stmt->execute([sanitizeInput($data['lesson_id'])]);
        $lesson = $stmt->fetch();
        
        if (!$lesson) {
            sendError('Les niet gevonden', 404);
        }
        
        // Check huidige reserveringen voor deze les/datum
        $stmt = $pdo->prepare("
            SELECT COUNT(*) as count 
            FROM reservations 
            WHERE lesson_id = ? AND lesson_date = ?
        ");
        $stmt->execute([sanitizeInput($data['lesson_id']), $data['lesson_date']]);
        $currentReservations = $stmt->fetch()['count'];
        
        if ($currentReservations >= $lesson['spots']) {
            sendError('Les is vol. Geen plekken meer beschikbaar.', 409);
        }
        
        // Check of deze persoon al is ingeschreven
        $stmt = $pdo->prepare("
            SELECT id FROM reservations 
            WHERE lesson_id = ? AND lesson_date = ? AND participant_email = ?
        ");
        $stmt->execute([
            sanitizeInput($data['lesson_id']), 
            $data['lesson_date'], 
            sanitizeInput($data['participant_email'])
        ]);
        
        if ($stmt->fetch()) {
            sendError('Je bent al ingeschreven voor deze les op deze datum', 409);
        }
        
        // Check welke kolommen beschikbaar zijn
        $stmt = $pdo->query("DESCRIBE reservations");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $columnNames = array_column($columns, 'Field');
        
        // Bouw de INSERT query dynamisch op basis van beschikbare kolommen
        $baseColumns = ['lesson_id', 'lesson_date', 'participant_name', 'participant_email'];
        $optionalColumns = [];
        $values = [
            sanitizeInput($data['lesson_id']),
            $data['lesson_date'],
            sanitizeInput($data['participant_name']),
            sanitizeInput($data['participant_email'])
        ];
        
        // Voeg optionele kolommen toe als ze bestaan
        if (in_array('participant_phone', $columnNames)) {
            $optionalColumns[] = 'participant_phone';
            $values[] = isset($data['participant_phone']) ? sanitizeInput($data['participant_phone']) : null;
        }
        
        if (in_array('notes', $columnNames)) {
            $optionalColumns[] = 'notes';
            $values[] = isset($data['notes']) ? sanitizeInput($data['notes']) : null;
        }
        
        $allColumns = array_merge($baseColumns, $optionalColumns);
        $placeholders = str_repeat('?,', count($allColumns) - 1) . '?';
        
        // Maak de reservering
        $sql = "INSERT INTO reservations (" . implode(', ', $allColumns) . ") VALUES (" . $placeholders . ")";
        $stmt = $pdo->prepare($sql);
        
        $result = $stmt->execute($values);
        
        if ($result) {
            $reservationId = $pdo->lastInsertId();
            
            // Haal de nieuwe reservering op voor response
            $stmt = $pdo->prepare("
                SELECT 
                    r.*,
                    l.title as lesson_title,
                    l.time as lesson_time,
                    l.trainer as lesson_trainer
                FROM reservations r
                JOIN lessons l ON r.lesson_id = l.id
                WHERE r.id = ?
            ");
            $stmt->execute([$reservationId]);
            $reservation = $stmt->fetch();
            
            sendResponse([
                'success' => true, 
                'message' => 'Reservering succesvol gemaakt',
                'reservation' => $reservation,
                'id' => $reservationId
            ]);
        } else {
            sendError('Fout bij maken reservering', 500);
        }
        
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) { // Duplicate entry
            sendError('Je bent al ingeschreven voor deze les', 409);
        } else {
            sendError('Database fout: ' . $e->getMessage(), 500);
        }
    }
}

function handleDeleteReservation() {
    global $pdo;
    
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    $email = isset($_GET['email']) ? sanitizeInput($_GET['email']) : null;
    $lessonId = isset($_GET['lesson_id']) ? sanitizeInput($_GET['lesson_id']) : null;
    $date = isset($_GET['date']) ? sanitizeInput($_GET['date']) : null;
    
    try {
        if ($id) {
            // Verwijder op basis van ID (admin functie)
            $stmt = $pdo->prepare("DELETE FROM reservations WHERE id = ?");
            $result = $stmt->execute([$id]);
        } elseif ($email && $lessonId && $date) {
            // Verwijder op basis van email, les en datum (gebruiker functie)
            $stmt = $pdo->prepare("
                DELETE FROM reservations 
                WHERE participant_email = ? AND lesson_id = ? AND lesson_date = ?
            ");
            $result = $stmt->execute([$email, $lessonId, $date]);
        } else {
            sendError('Onvoldoende parameters voor verwijderen reservering', 400);
        }
        
        if ($stmt->rowCount() > 0) {
            sendResponse(['success' => true, 'message' => 'Reservering succesvol geannuleerd']);
        } else {
            sendError('Reservering niet gevonden', 404);
        }
        
    } catch (PDOException $e) {
        sendError('Fout bij annuleren reservering: ' . $e->getMessage(), 500);
    }
}

// Extra functie: haal reservering statistieken
if (isset($_GET['stats']) && $_GET['stats'] === 'true') {
    handleGetStats();
}

function handleGetStats() {
    global $pdo;
    
    try {
        // Totaal aantal reserveringen deze maand
        $stmt = $pdo->query("
            SELECT COUNT(*) as total_this_month
            FROM reservations 
            WHERE MONTH(lesson_date) = MONTH(CURRENT_DATE()) 
            AND YEAR(lesson_date) = YEAR(CURRENT_DATE())

        ");
        $thisMonth = $stmt->fetch()['total_this_month'];
        
        // Populairste lessen
        $stmt = $pdo->query("
            SELECT 
                l.title,
                l.trainer,
                COUNT(r.id) as reservation_count
            FROM lessons l
            LEFT JOIN reservations r ON l.id = r.lesson_id
            GROUP BY l.id, l.title, l.trainer
            ORDER BY reservation_count DESC
            LIMIT 5
        ");
        $popularLessons = $stmt->fetchAll();
        
        sendResponse([
            'total_this_month' => (int)$thisMonth,
            'popular_lessons' => $popularLessons
        ]);
        
    } catch (PDOException $e) {
        sendError('Fout bij ophalen statistieken: ' . $e->getMessage(), 500);
    }
}
?>