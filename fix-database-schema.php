<?php
/**
 * Database Schema Fix Script
 * Voert automatisch de benodigde database wijzigingen uit
 */

require_once 'api-implementation/config.php';

echo "<!DOCTYPE html>
<html>
<head>
    <title>Database Schema Fix</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .success { color: #28a745; margin: 10px 0; }
        .error { color: #dc3545; margin: 10px 0; }
        .warning { color: #ffc107; margin: 10px 0; }
        .info { color: #17a2b8; margin: 10px 0; }
        h1 { color: #333; }
        pre { background: #f8f9fa; padding: 15px; border-radius: 4px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class='container'>
        <h1>🔧 Database Schema Fix</h1>
        <p>Dit script voegt de ontbrekende kolommen toe aan de admin_users tabel.</p>
        <hr>";

try {
    // Check huidige tabel structuur
    echo "<h3>📋 Controleer huidige tabel structuur:</h3>";
    
    $stmt = $pdo->query("DESCRIBE admin_users");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $hasRole = false;
    $hasFailedAttempts = false;
    $hasLastFailed = false;
    
    foreach ($columns as $column) {
        if ($column['Field'] === 'role') $hasRole = true;
        if ($column['Field'] === 'failed_login_attempts') $hasFailedAttempts = true;
        if ($column['Field'] === 'last_failed_login') $hasLastFailed = true;
    }
    
    echo "<div class='info'>Huidige kolommen in admin_users:</div>";
    echo "<pre>";
    foreach ($columns as $column) {
        echo $column['Field'] . " (" . $column['Type'] . ")\n";
    }
    echo "</pre>";
    
    // Voeg ontbrekende kolommen toe
    echo "<h3>🔨 Voeg ontbrekende kolommen toe:</h3>";
    
    if (!$hasRole) {
        $pdo->exec("ALTER TABLE admin_users ADD COLUMN role VARCHAR(20) DEFAULT 'admin'");
        echo "<div class='success'>✅ Kolom 'role' toegevoegd</div>";
    } else {
        echo "<div class='warning'>⚠️ Kolom 'role' bestaat al</div>";
    }
    
    if (!$hasFailedAttempts) {
        $pdo->exec("ALTER TABLE admin_users ADD COLUMN failed_login_attempts INT DEFAULT 0");
        echo "<div class='success'>✅ Kolom 'failed_login_attempts' toegevoegd</div>";
    } else {
        echo "<div class='warning'>⚠️ Kolom 'failed_login_attempts' bestaat al</div>";
    }
    
    if (!$hasLastFailed) {
        $pdo->exec("ALTER TABLE admin_users ADD COLUMN last_failed_login TIMESTAMP NULL");
        echo "<div class='success'>✅ Kolom 'last_failed_login' toegevoegd</div>";
    } else {
        echo "<div class='warning'>⚠️ Kolom 'last_failed_login' bestaat al</div>";
    }
    
    // Update bestaande records
    echo "<h3>🔄 Update bestaande records:</h3>";
    $stmt = $pdo->prepare("UPDATE admin_users SET role = 'admin', failed_login_attempts = 0 WHERE role IS NULL OR failed_login_attempts IS NULL");
    $stmt->execute();
    echo "<div class='success'>✅ Bestaande admin records bijgewerkt</div>";
    
    // Fix admin_sessions tabel
    echo "<h3>🗂️ Fix admin_sessions tabel:</h3>";
    
    // Check of admin_sessions tabel bestaat
    $stmt = $pdo->query("SHOW TABLES LIKE 'admin_sessions'");
    if ($stmt->rowCount() > 0) {
        // Check kolom structuur
        $stmt = $pdo->query("DESCRIBE admin_sessions");
        $sessionColumns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $hasCorrectStructure = false;
        foreach ($sessionColumns as $column) {
            if ($column['Field'] === 'session_token' && $column['Key'] === 'PRI') {
                $hasCorrectStructure = true;
                break;
            }
        }
        
        if (!$hasCorrectStructure) {
            $pdo->exec("DROP TABLE admin_sessions");
            echo "<div class='warning'>⚠️ Oude admin_sessions tabel verwijderd</div>";
        }
    }
    
    // Recreate admin_sessions tabel met correcte structuur
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS admin_sessions (
            session_token VARCHAR(128) PRIMARY KEY,
            admin_id INT NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE,
            INDEX idx_expires (expires_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "<div class='success'>✅ Admin_sessions tabel aangemaakt met correcte structuur</div>";
    
    // Toon finale tabel structuur
    echo "<h3>✅ Finale tabel structuur:</h3>";
    
    $stmt = $pdo->query("DESCRIBE admin_users");
    $finalColumns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<div class='info'>Admin_users kolommen:</div>";
    echo "<pre>";
    foreach ($finalColumns as $column) {
        echo $column['Field'] . " (" . $column['Type'] . ")\n";
    }
    echo "</pre>";
    
    $stmt = $pdo->query("DESCRIBE admin_sessions");
    $sessionColumns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<div class='info'>Admin_sessions kolommen:</div>";
    echo "<pre>";
    foreach ($sessionColumns as $column) {
        echo $column['Field'] . " (" . $column['Type'] . ")\n";
    }
    echo "</pre>";
    
    echo "<h3>🎉 Database schema succesvol bijgewerkt!</h3>";
    echo "<div class='success'>Je kunt nu proberen in te loggen in het admin panel.</div>";
    
} catch (PDOException $e) {
    echo "<div class='error'>❌ Database fout: " . $e->getMessage() . "</div>";
} catch (Exception $e) {
    echo "<div class='error'>❌ Algemene fout: " . $e->getMessage() . "</div>";
}

echo "
        <hr>
        <p><strong>Volgende stappen:</strong></p>
        <ol>
            <li>Ga naar je admin panel: <a href='/admin'>/admin</a></li>
            <li>Log in met: username = 'rebeladmin', password = 'rebels123'</li>
            <li>Verwijder dit bestand na gebruik voor veiligheid</li>
        </ol>
    </div>
</body>
</html>";
?>