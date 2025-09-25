<?php
require_once 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    echo json_encode(['status' => 'starting', 'message' => 'Checking reservations table structure...']) . "\n";
    
    // Check if reservations table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'reservations'");
    $tableExists = $stmt->fetch();
    
    if (!$tableExists) {
        echo json_encode(['status' => 'creating', 'message' => 'Creating reservations table...']) . "\n";
        
        // Create the reservations table
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS reservations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                lesson_id VARCHAR(36) NOT NULL,
                lesson_date DATE NOT NULL,
                participant_name VARCHAR(255) NOT NULL,
                participant_email VARCHAR(255) NOT NULL,
                participant_phone VARCHAR(20),
                notes TEXT,
                status ENUM('confirmed', 'cancelled', 'pending') DEFAULT 'confirmed',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
                UNIQUE KEY unique_reservation (lesson_id, lesson_date, participant_email),
                INDEX idx_lesson_date (lesson_id, lesson_date),
                INDEX idx_email (participant_email)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
        
        echo json_encode(['status' => 'success', 'message' => 'Reservations table created successfully']) . "\n";
    } else {
        echo json_encode(['status' => 'exists', 'message' => 'Reservations table already exists']) . "\n";
        
        // Check table structure
        $stmt = $pdo->query("DESCRIBE reservations");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $columnNames = array_column($columns, 'Field');
        
        echo json_encode(['status' => 'structure', 'columns' => $columnNames]) . "\n";
        
        // Check if lesson_date column exists
        if (!in_array('lesson_date', $columnNames)) {
            echo json_encode(['status' => 'fixing', 'message' => 'Adding missing lesson_date column...']) . "\n";
            
            $pdo->exec("ALTER TABLE reservations ADD COLUMN lesson_date DATE NOT NULL AFTER lesson_id");
            
            echo json_encode(['status' => 'fixed', 'message' => 'lesson_date column added']) . "\n";
        } else {
            echo json_encode(['status' => 'ok', 'message' => 'lesson_date column exists']) . "\n";
        }
        
        // Check other required columns
        $requiredColumns = ['participant_name', 'participant_email', 'created_at'];
        $missingColumns = array_diff($requiredColumns, $columnNames);
        
        if (!empty($missingColumns)) {
            echo json_encode(['status' => 'missing', 'columns' => $missingColumns]) . "\n";
            
            foreach ($missingColumns as $column) {
                switch ($column) {
                    case 'participant_name':
                        $pdo->exec("ALTER TABLE reservations ADD COLUMN participant_name VARCHAR(255) NOT NULL");
                        break;
                    case 'participant_email':
                        $pdo->exec("ALTER TABLE reservations ADD COLUMN participant_email VARCHAR(255) NOT NULL");
                        break;
                    case 'created_at':
                        $pdo->exec("ALTER TABLE reservations ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
                        break;
                }
                echo json_encode(['status' => 'added', 'column' => $column]) . "\n";
            }
        }
    }
    
    // Test the problematic query
    echo json_encode(['status' => 'testing', 'message' => 'Testing query...']) . "\n";
    
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
        LIMIT 1
    ");
    
    echo json_encode(['status' => 'success', 'message' => 'Query executed successfully']) . "\n";
    
    // Final structure check
    $stmt = $pdo->query("DESCRIBE reservations");
    $finalColumns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'status' => 'complete',
        'message' => 'Reservations table is ready',
        'final_structure' => $finalColumns
    ]) . "\n";
    
} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage(),
        'code' => $e->getCode()
    ]) . "\n";
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'General error: ' . $e->getMessage()
    ]) . "\n";
}
?>