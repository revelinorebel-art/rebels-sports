<?php
/**
 * REBELS SPORTS - Database Connection Debug Tool
 * Upload dit bestand naar public_html/ om de database verbinding te testen
 */

echo "<h1>🔍 Database Connection Debug Tool</h1>";
echo "<p>Test de database verbinding op Hostinger</p>";

// Check if .env file exists
echo "<h2>1. .env Bestand Check</h2>";
$envPath = __DIR__ . '/.env';
if (file_exists($envPath)) {
    echo "✅ .env bestand gevonden: " . $envPath . "<br>";
    
    // Load .env file
    $envContent = file_get_contents($envPath);
    echo "<h3>📄 .env Inhoud (geanonimiseerd):</h3>";
    echo "<pre>";
    $lines = explode("\n", $envContent);
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || strpos($line, '#') === 0) {
            echo htmlspecialchars($line) . "\n";
        } else {
            $parts = explode('=', $line, 2);
            if (count($parts) === 2) {
                $key = $parts[0];
                $value = $parts[1];
                if (strpos($key, 'PASSWORD') !== false) {
                    echo $key . "=***HIDDEN***\n";
                } else {
                    echo htmlspecialchars($line) . "\n";
                }
            }
        }
    }
    echo "</pre>";
} else {
    echo "❌ .env bestand NIET gevonden in: " . $envPath . "<br>";
    echo "🚨 Dit is waarschijnlijk het probleem!<br>";
}

// Load environment variables
function loadEnv($path) {
    if (!file_exists($path)) {
        return false;
    }
    
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        
        if (strpos($line, '=') !== false) {
            list($name, $value) = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value);
            
            if (!array_key_exists($name, $_ENV)) {
                $_ENV[$name] = $value;
            }
        }
    }
    return true;
}

echo "<h2>2. Environment Variables</h2>";
if (loadEnv($envPath)) {
    echo "✅ Environment variables geladen<br>";
    
    $dbVars = ['DB_HOST', 'DB_NAME', 'DB_USERNAME', 'DB_PASSWORD', 'DB_PORT'];
    foreach ($dbVars as $var) {
        $value = $_ENV[$var] ?? 'NIET GEVONDEN';
        if ($var === 'DB_PASSWORD') {
            $value = $value !== 'NIET GEVONDEN' ? '***HIDDEN***' : 'NIET GEVONDEN';
        }
        echo "$var = $value<br>";
    }
} else {
    echo "❌ Kon environment variables niet laden<br>";
}

// Test database connection
echo "<h2>3. Database Verbinding Test</h2>";

$host = $_ENV['DB_HOST'] ?? 'localhost';
$dbname = $_ENV['DB_NAME'] ?? '';
$username = $_ENV['DB_USERNAME'] ?? '';
$password = $_ENV['DB_PASSWORD'] ?? '';
$port = $_ENV['DB_PORT'] ?? '3306';

echo "Probeer verbinding te maken met:<br>";
echo "Host: $host<br>";
echo "Database: $dbname<br>";
echo "Username: $username<br>";
echo "Port: $port<br><br>";

try {
    $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4";
    echo "DSN: $dsn<br><br>";
    
    $pdo = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    
    echo "✅ <strong>Database verbinding SUCCESVOL!</strong><br>";
    
    // Test if lessons table exists
    echo "<h2>4. Lessons Tabel Check</h2>";
    $stmt = $pdo->query("SHOW TABLES LIKE 'lessons'");
    if ($stmt->rowCount() > 0) {
        echo "✅ Lessons tabel gevonden<br>";
        
        // Show table structure
        $stmt = $pdo->query("DESCRIBE lessons");
        $columns = $stmt->fetchAll();
        echo "<h3>📋 Tabel Structuur:</h3>";
        echo "<table border='1' style='border-collapse: collapse;'>";
        echo "<tr><th>Column</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th></tr>";
        foreach ($columns as $column) {
            echo "<tr>";
            echo "<td>" . htmlspecialchars($column['Field']) . "</td>";
            echo "<td>" . htmlspecialchars($column['Type']) . "</td>";
            echo "<td>" . htmlspecialchars($column['Null']) . "</td>";
            echo "<td>" . htmlspecialchars($column['Key']) . "</td>";
            echo "<td>" . htmlspecialchars($column['Default']) . "</td>";
            echo "</tr>";
        }
        echo "</table>";
        
        // Count records
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM lessons");
        $count = $stmt->fetch()['count'];
        echo "<br>📊 Aantal lessen in database: $count<br>";
        
    } else {
        echo "❌ Lessons tabel NIET gevonden<br>";
        echo "🚨 De database tabel moet nog aangemaakt worden!<br>";
    }
    
} catch(PDOException $e) {
    echo "❌ <strong>Database verbinding MISLUKT!</strong><br>";
    echo "🚨 Error: " . htmlspecialchars($e->getMessage()) . "<br>";
    echo "<br><strong>Mogelijke oorzaken:</strong><br>";
    echo "1. Database gegevens zijn incorrect<br>";
    echo "2. Database bestaat niet<br>";
    echo "3. Gebruiker heeft geen toegang<br>";
    echo "4. Hostinger database server is niet bereikbaar<br>";
}

echo "<h2>5. API Bestanden Check</h2>";
$apiFiles = ['config.php', 'lessons.php', 'admin.php', 'reservations.php', 'services.php'];
$apiDir = __DIR__ . '/api/';

foreach ($apiFiles as $file) {
    $filePath = $apiDir . $file;
    if (file_exists($filePath)) {
        echo "✅ $file gevonden<br>";
    } else {
        echo "❌ $file NIET gevonden in: $filePath<br>";
    }
}

echo "<br><hr>";
echo "<p><strong>📝 Instructies:</strong></p>";
echo "<p>1. Upload dit bestand naar public_html/</p>";
echo "<p>2. Ga naar: https://jouw-domein.hostingersite.com/debug-database-connection.php</p>";
echo "<p>3. Bekijk de resultaten en deel ze met de developer</p>";
echo "<p>4. Verwijder dit bestand na gebruik (beveiligingsreden)</p>";
?>