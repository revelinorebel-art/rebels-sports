<?php
/**
 * REBELS SPORTS - Services API
 * Handles all service-related operations
 */

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch($method) {
    case 'GET':
        handleGetServices();
        break;
        
    case 'POST':
        handleCreateService($input);
        break;
        
    case 'PUT':
        handleUpdateService($input);
        break;
        
    case 'DELETE':
        handleDeleteService();
        break;
        
    default:
        sendError('Method not allowed', 405);
}

function handleGetServices() {
    global $pdo;
    
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    $category = isset($_GET['category']) ? sanitizeInput($_GET['category']) : null;
    
    try {
        if ($id) {
            // Haal specifieke service
            $stmt = $pdo->prepare("SELECT * FROM services WHERE id = ?");
            $stmt->execute([$id]);
            $service = $stmt->fetch();
            
            if ($service) {
                sendResponse($service);
            } else {
                sendError('Service niet gevonden', 404);
            }
            
        } elseif ($category) {
            // Haal services per categorie
            $stmt = $pdo->prepare("SELECT * FROM services WHERE category = ? ORDER BY display_order, title");
            $stmt->execute([$category]);
            $services = $stmt->fetchAll();
            sendResponse($services);
            
        } else {
            // Haal alle services
            $stmt = $pdo->query("SELECT * FROM services ORDER BY category, display_order, title");
            $services = $stmt->fetchAll();
            
            // Groepeer per categorie voor frontend
            $grouped = [];
            foreach ($services as $service) {
                $cat = $service['category'];
                if (!isset($grouped[$cat])) {
                    $grouped[$cat] = [];
                }
                $grouped[$cat][] = $service;
            }
            
            sendResponse([
                'all_services' => $services,
                'grouped_by_category' => $grouped
            ]);
        }
        
    } catch (PDOException $e) {
        sendError('Fout bij ophalen services: ' . $e->getMessage(), 500);
    }
}

function handleCreateService($data) {
    global $pdo;
    
    // Valideer input
    validateInput($data, ['title', 'description', 'price', 'category']);
    
    try {
        // Bepaal display_order (laatste + 1 in categorie)
        $stmt = $pdo->prepare("SELECT MAX(display_order) as max_order FROM services WHERE category = ?");
        $stmt->execute([sanitizeInput($data['category'])]);
        $maxOrder = $stmt->fetch()['max_order'] ?? 0;
        $displayOrder = $maxOrder + 1;
        
        $stmt = $pdo->prepare("
            INSERT INTO services (title, description, price, duration, category, features, image_url, display_order, is_active) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $result = $stmt->execute([
            sanitizeInput($data['title']),
            sanitizeInput($data['description']),
            (float)$data['price'],
            isset($data['duration']) ? sanitizeInput($data['duration']) : null,
            sanitizeInput($data['category']),
            isset($data['features']) ? json_encode($data['features']) : null,
            isset($data['image_url']) ? sanitizeInput($data['image_url']) : null,
            $displayOrder,
            isset($data['is_active']) ? (bool)$data['is_active'] : true
        ]);
        
        if ($result) {
            $serviceId = $pdo->lastInsertId();
            
            // Haal de nieuwe service op
            $stmt = $pdo->prepare("SELECT * FROM services WHERE id = ?");
            $stmt->execute([$serviceId]);
            $service = $stmt->fetch();
            
            sendResponse([
                'success' => true, 
                'message' => 'Service succesvol aangemaakt',
                'service' => $service,
                'id' => $serviceId
            ]);
        } else {
            sendError('Fout bij aanmaken service', 500);
        }
        
    } catch (PDOException $e) {
        sendError('Database fout: ' . $e->getMessage(), 500);
    }
}

function handleUpdateService($data) {
    global $pdo;
    
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    if (!$id) {
        sendError('Service ID is vereist', 400);
    }
    
    try {
        // Check of service bestaat
        $stmt = $pdo->prepare("SELECT * FROM services WHERE id = ?");
        $stmt->execute([$id]);
        $existingService = $stmt->fetch();
        
        if (!$existingService) {
            sendError('Service niet gevonden', 404);
        }
        
        // Bouw update query dynamisch
        $updateFields = [];
        $updateValues = [];
        
        $allowedFields = ['title', 'description', 'price', 'duration', 'category', 'image_url', 'display_order', 'is_active'];
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updateFields[] = "$field = ?";
                
                if ($field === 'price') {
                    $updateValues[] = (float)$data[$field];
                } elseif ($field === 'is_active') {
                    $updateValues[] = (bool)$data[$field];
                } elseif ($field === 'display_order') {
                    $updateValues[] = (int)$data[$field];
                } else {
                    $updateValues[] = sanitizeInput($data[$field]);
                }
            }
        }
        
        // Handle features apart (JSON)
        if (isset($data['features'])) {
            $updateFields[] = "features = ?";
            $updateValues[] = json_encode($data['features']);
        }
        
        if (empty($updateFields)) {
            sendError('Geen velden om bij te werken', 400);
        }
        
        $updateValues[] = $id; // Voor WHERE clause
        
        $sql = "UPDATE services SET " . implode(', ', $updateFields) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $result = $stmt->execute($updateValues);
        
        if ($result) {
            // Haal bijgewerkte service op
            $stmt = $pdo->prepare("SELECT * FROM services WHERE id = ?");
            $stmt->execute([$id]);
            $service = $stmt->fetch();
            
            sendResponse([
                'success' => true, 
                'message' => 'Service succesvol bijgewerkt',
                'service' => $service
            ]);
        } else {
            sendError('Fout bij bijwerken service', 500);
        }
        
    } catch (PDOException $e) {
        sendError('Database fout: ' . $e->getMessage(), 500);
    }
}

function handleDeleteService() {
    global $pdo;
    
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    if (!$id) {
        sendError('Service ID is vereist', 400);
    }
    
    try {
        $stmt = $pdo->prepare("DELETE FROM services WHERE id = ?");
        $result = $stmt->execute([$id]);
        
        if ($stmt->rowCount() > 0) {
            sendResponse(['success' => true, 'message' => 'Service succesvol verwijderd']);
        } else {
            sendError('Service niet gevonden', 404);
        }
        
    } catch (PDOException $e) {
        sendError('Fout bij verwijderen service: ' . $e->getMessage(), 500);
    }
}

// Extra functie: herorden services binnen categorie
if (isset($_GET['reorder']) && $_GET['reorder'] === 'true') {
    handleReorderServices();
}

function handleReorderServices() {
    global $pdo;
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['category']) || !isset($input['service_ids'])) {
        sendError('Categorie en service IDs zijn vereist', 400);
    }
    
    try {
        $pdo->beginTransaction();
        
        $category = sanitizeInput($input['category']);
        $serviceIds = $input['service_ids'];
        
        // Update display_order voor elke service
        foreach ($serviceIds as $index => $serviceId) {
            $stmt = $pdo->prepare("
                UPDATE services 
                SET display_order = ? 
                WHERE id = ? AND category = ?
            ");
            $stmt->execute([$index + 1, (int)$serviceId, $category]);
        }
        
        $pdo->commit();
        
        sendResponse([
            'success' => true, 
            'message' => 'Services succesvol herordend'
        ]);
        
    } catch (PDOException $e) {
        $pdo->rollBack();
        sendError('Fout bij herordenen services: ' . $e->getMessage(), 500);
    }
}
?>