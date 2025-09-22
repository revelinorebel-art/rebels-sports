# 🚀 REBELS SPORTS - Hostinger Deployment Guide

## 📋 Overzicht
Deze gids helpt je om je REBELS SPORTS website van localStorage naar een productie-klare database oplossing te migreren voor hosting bij Hostinger.

## 🔍 Huidige Situatie Analyse

### LocalStorage Data die gemigreerd moet worden:
1. **`rebelsClasses`** - Alle fitness lessen
2. **`rebelsReservations`** - Reserveringen per les per datum
3. **`rebelsRegistrations`** - Inschrijvingen overzicht
4. **`rebelsServices`** - Services/diensten
5. **`adminAuthenticated`** - Admin authenticatie status

### Data Structuur:
```javascript
// rebelsClasses
[
  {
    id: "uuid",
    title: "Fitness Les",
    time: "19:00",
    trainer: "John Doe",
    spots: 15,
    day: 1, // 1=Maandag, 7=Zondag
    date: "2024-01-15", // Optioneel
    description: "Beschrijving"
  }
]

// rebelsReservations
{
  "lesId-2024-01-15": {
    reservedSpots: 5,
    registrations: [...]
  }
}
```

## 🏗️ Hostinger Oplossingen

### Optie 1: MySQL Database (Aanbevolen)
**Voordelen:**
- Robuust en schaalbaar
- Ingebouwd in de meeste Hostinger pakketten
- Goede prestaties

**Nadelen:**
- Vereist backend API (PHP/Node.js)
- Meer complexe setup

### Optie 2: JSON Files + PHP
**Voordelen:**
- Eenvoudiger te implementeren
- Geen database configuratie nodig
- Snelle migratie

**Nadelen:**
- Minder schaalbaar
- Geen geavanceerde query mogelijkheden

### Optie 3: Hostinger Cloud Database
**Voordelen:**
- Volledig beheerd
- Automatische backups
- Hoge beschikbaarheid

**Nadelen:**
- Extra kosten
- Mogelijk overkill voor kleine website

## 🎯 Aanbevolen Aanpak: MySQL + PHP API

### Stap 1: Database Setup
```sql
-- Maak database tabellen
CREATE TABLE lessons (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    time TIME NOT NULL,
    trainer VARCHAR(255) NOT NULL,
    spots INT NOT NULL DEFAULT 15,
    day_of_week TINYINT NOT NULL, -- 1-7
    specific_date DATE NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lesson_id VARCHAR(36) NOT NULL,
    lesson_date DATE NOT NULL,
    participant_name VARCHAR(255) NOT NULL,
    participant_email VARCHAR(255) NOT NULL,
    participant_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    UNIQUE KEY unique_reservation (lesson_id, lesson_date, participant_email)
);

CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Stap 2: PHP API Endpoints
Maak een `api/` folder met de volgende bestanden:

#### `api/config.php`
```php
<?php
// Database configuratie
$host = 'localhost'; // Of je Hostinger database host
$dbname = 'je_database_naam';
$username = 'je_database_gebruiker';
$password = 'je_database_wachtwoord';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die("Database connectie mislukt: " . $e->getMessage());
}

// CORS headers voor frontend
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}
?>
```

#### `api/lessons.php`
```php
<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        // Haal alle lessen op
        $stmt = $pdo->query("SELECT * FROM lessons ORDER BY day_of_week, time");
        $lessons = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($lessons);
        break;
        
    case 'POST':
        // Voeg nieuwe les toe
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("INSERT INTO lessons (id, title, time, trainer, spots, day_of_week, specific_date, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['id'],
            $data['title'],
            $data['time'],
            $data['trainer'],
            $data['spots'],
            $data['day'],
            $data['date'] ?? null,
            $data['description']
        ]);
        echo json_encode(['success' => true, 'id' => $data['id']]);
        break;
        
    case 'PUT':
        // Update bestaande les
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("UPDATE lessons SET title=?, time=?, trainer=?, spots=?, day_of_week=?, specific_date=?, description=? WHERE id=?");
        $stmt->execute([
            $data['title'],
            $data['time'],
            $data['trainer'],
            $data['spots'],
            $data['day'],
            $data['date'] ?? null,
            $data['description'],
            $data['id']
        ]);
        echo json_encode(['success' => true]);
        break;
        
    case 'DELETE':
        // Verwijder les
        $id = $_GET['id'];
        $stmt = $pdo->prepare("DELETE FROM lessons WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);
        break;
}
?>
```

### Stap 3: Frontend Aanpassingen
Vervang localStorage calls met API calls:

#### Nieuwe API service (`src/services/apiService.js`):
```javascript
const API_BASE = 'https://jouwdomain.com/api';

export const apiService = {
    // Lessen
    async getLessons() {
        const response = await fetch(`${API_BASE}/lessons.php`);
        return response.json();
    },
    
    async createLesson(lesson) {
        const response = await fetch(`${API_BASE}/lessons.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lesson)
        });
        return response.json();
    },
    
    async updateLesson(lesson) {
        const response = await fetch(`${API_BASE}/lessons.php`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lesson)
        });
        return response.json();
    },
    
    async deleteLesson(id) {
        const response = await fetch(`${API_BASE}/lessons.php?id=${id}`, {
            method: 'DELETE'
        });
        return response.json();
    },
    
    // Reserveringen
    async getReservations(lessonId, date) {
        const response = await fetch(`${API_BASE}/reservations.php?lesson_id=${lessonId}&date=${date}`);
        return response.json();
    },
    
    async createReservation(reservation) {
        const response = await fetch(`${API_BASE}/reservations.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reservation)
        });
        return response.json();
    }
};
```

## 📦 Deployment Checklist

### Voor Deployment:
- [ ] Database aanmaken bij Hostinger
- [ ] Database tabellen aanmaken
- [ ] PHP API bestanden uploaden naar `/api/` folder
- [ ] Database credentials configureren in `config.php`
- [ ] Frontend bouwen: `npm run build`
- [ ] Build bestanden uploaden naar public_html
- [ ] API endpoints testen
- [ ] Admin wachtwoord instellen
- [ ] SSL certificaat activeren

### Na Deployment:
- [ ] Alle functionaliteiten testen
- [ ] Backup strategie opzetten
- [ ] Monitoring instellen
- [ ] Performance optimalisatie

## 🔒 Beveiliging

### Belangrijke beveiligingsmaatregelen:
1. **Wachtwoorden hashen** met `password_hash()` in PHP
2. **SQL Injection preventie** met prepared statements
3. **CSRF tokens** voor admin acties
4. **Rate limiting** voor API calls
5. **Input validatie** op server-side
6. **HTTPS** verplicht maken

### Admin authenticatie verbeteren:
```php
// api/auth.php
session_start();

function authenticateAdmin($username, $password) {
    global $pdo;
    $stmt = $pdo->prepare("SELECT password_hash FROM admin_users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();
    
    if ($user && password_verify($password, $user['password_hash'])) {
        $_SESSION['admin_authenticated'] = true;
        return true;
    }
    return false;
}
```

## 💡 Alternatieve Snelle Oplossing

Als je snel live wilt gaan zonder database:

### JSON Files Aanpak:
1. Maak `data/` folder op server
2. Sla data op in JSON bestanden
3. Gebruik PHP voor lezen/schrijven
4. Implementeer file locking voor concurrency

```php
// api/simple-storage.php
function saveData($filename, $data) {
    $file = "data/$filename.json";
    file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT), LOCK_EX);
}

function loadData($filename) {
    $file = "data/$filename.json";
    if (file_exists($file)) {
        return json_decode(file_get_contents($file), true);
    }
    return [];
}
```

## 🎯 Volgende Stappen

1. **Kies je aanpak** (MySQL of JSON files)
2. **Test lokaal** met XAMPP/WAMP
3. **Maak database** bij Hostinger
4. **Upload bestanden**
5. **Test alles grondig**
6. **Ga live!**

## 📞 Hulp Nodig?

Als je hulp nodig hebt bij de implementatie, laat het me weten! Ik kan je helpen met:
- Database setup
- PHP API code
- Frontend aanpassingen
- Deployment proces
- Troubleshooting

---
*Deze gids is specifiek gemaakt voor REBELS SPORTS website deployment op Hostinger.*