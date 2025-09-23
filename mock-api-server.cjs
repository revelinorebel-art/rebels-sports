const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const PORT = 8080;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Additional CORS headers for all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

// SQLite database setup
const dbPath = path.join(__dirname, 'rebels_local.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
    // Admin users table
    db.run(`
        CREATE TABLE IF NOT EXISTS admin_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username VARCHAR(50) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(20) DEFAULT 'admin',
            failed_login_attempts INTEGER DEFAULT 0,
            last_failed_login DATETIME NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    // Admin sessions table
    db.run(`
        CREATE TABLE IF NOT EXISTS admin_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            admin_id INTEGER NOT NULL,
            session_token VARCHAR(255) UNIQUE NOT NULL,
            expires_at DATETIME NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE
        )
    `);
    
    // Lessons table
    db.run(`
        CREATE TABLE IF NOT EXISTS lessons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title VARCHAR(255) NOT NULL,
            time VARCHAR(10) NOT NULL,
            trainer VARCHAR(255) NOT NULL,
            spots INTEGER NOT NULL,
            day_of_week INTEGER NOT NULL,
            specific_date VARCHAR(10) NULL,
            description TEXT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    // Insert default admin user
    const defaultPassword = 'rebels123';
    bcrypt.hash(defaultPassword, 10, (err, hash) => {
        if (err) {
            console.error('Error hashing password:', err);
            return;
        }
        
        db.run(`
            INSERT OR IGNORE INTO admin_users (username, password_hash, role) 
            VALUES (?, ?, ?)
        `, ['rebeladmin', hash, 'admin'], (err) => {
            if (err) {
                console.error('Error inserting admin user:', err);
            } else {
                console.log('Default admin user created/verified');
            }
        });
    });
    
    // Insert default lessons
    const defaultLessons = [
        { title: 'Kickboksen Beginners', time: '18:00', trainer: 'Mike Johnson', spots: 15, day_of_week: 1, description: 'Perfecte les voor beginners in kickboksen' },
        { title: 'CrossFit', time: '19:30', trainer: 'Sarah Wilson', spots: 12, day_of_week: 1, description: 'Intensieve CrossFit training' },
        { title: 'Yoga Flow', time: '09:00', trainer: 'Emma Davis', spots: 20, day_of_week: 2, description: 'Ontspannende yoga flow sessie' },
        { title: 'Kickboksen Gevorderden', time: '20:00', trainer: 'Mike Johnson', spots: 10, day_of_week: 2, description: 'Voor ervaren kickboksers' },
        { title: 'HIIT Training', time: '18:30', trainer: 'Tom Anderson', spots: 15, day_of_week: 3, description: 'High Intensity Interval Training' },
        { title: 'Pilates', time: '10:00', trainer: 'Lisa Brown', spots: 18, day_of_week: 4, description: 'Core strengthening pilates' },
        { title: 'Kickboksen Open', time: '19:00', trainer: 'Mike Johnson', spots: 20, day_of_week: 4, description: 'Open kickboks training voor alle niveaus' },
        { title: 'Zumba', time: '18:00', trainer: 'Maria Garcia', spots: 25, day_of_week: 5, description: 'Energieke dans workout' },
        { title: 'Bootcamp', time: '08:00', trainer: 'Tom Anderson', spots: 15, day_of_week: 6, description: 'Outdoor bootcamp training' },
        { title: 'Yoga Restore', time: '11:00', trainer: 'Emma Davis', spots: 16, day_of_week: 6, description: 'Herstellende yoga sessie' }
    ];
    
    defaultLessons.forEach(lesson => {
        db.run(`
            INSERT OR IGNORE INTO lessons (title, time, trainer, spots, day_of_week, description) 
            VALUES (?, ?, ?, ?, ?, ?)
        `, [lesson.title, lesson.time, lesson.trainer, lesson.spots, lesson.day_of_week, lesson.description], (err) => {
            if (err) {
                console.error('Error inserting lesson:', err);
            }
        });
    });
});

// Admin login endpoint
app.post('/admin.php', (req, res) => {
    const { action } = req.query;
    
    if (action === 'login') {
        const { username, password } = req.body;
        
        console.log('Login attempt:', { username, password });
        
        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Username en password zijn verplicht' 
            });
        }
        
        db.get(
            'SELECT * FROM admin_users WHERE username = ?',
            [username],
            (err, user) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ 
                        success: false, 
                        error: 'Database fout' 
                    });
                }
                
                if (!user) {
                    console.log('User not found for username:', username);
                    return res.status(401).json({ 
                        success: false, 
                        error: 'Ongeldige inloggegevens' 
                    });
                }
                
                console.log('User found:', { id: user.id, username: user.username });
                
                bcrypt.compare(password, user.password_hash, (err, isValid) => {
                    if (err) {
                        console.error('Password comparison error:', err);
                        return res.status(500).json({ 
                            success: false, 
                            error: 'Authenticatie fout' 
                        });
                    }
                    
                    if (!isValid) {
                        console.log('Password comparison failed for user:', username);
                        return res.status(401).json({ 
                            success: false, 
                            error: 'Ongeldige inloggegevens' 
                        });
                    }
                    
                    console.log('Password comparison successful for user:', username);
                    
                    // Generate session token
                    const sessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
                    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
                    
                    db.run(
                        'INSERT INTO admin_sessions (admin_id, session_token, expires_at) VALUES (?, ?, ?)',
                        [user.id, sessionToken, expiresAt.toISOString()],
                        (err) => {
                            if (err) {
                                console.error('Session creation error:', err);
                                return res.status(500).json({ 
                                    success: false, 
                                    error: 'Sessie aanmaken mislukt' 
                                });
                            }
                            
                            res.json({
                                success: true,
                                message: 'Login succesvol',
                                token: sessionToken,
                                user: {
                                    id: user.id,
                                    username: user.username,
                                    role: user.role
                                }
                            });
                        }
                    );
                });
            }
        );
    } else if (action === 'verify') {
        // Session verification
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                error: 'Geen token gevonden' 
            });
        }
        
        db.get(
            `SELECT s.*, u.username, u.role 
             FROM admin_sessions s 
             JOIN admin_users u ON s.admin_id = u.id 
             WHERE s.session_token = ? AND s.expires_at > datetime('now')`,
            [token],
            (err, session) => {
                if (err) {
                    console.error('Session verification error:', err);
                    return res.status(500).json({ 
                        success: false, 
                        error: 'Sessie verificatie mislukt' 
                    });
                }
                
                if (!session) {
                    return res.status(401).json({ 
                        success: false, 
                        error: 'Ongeldige of verlopen sessie' 
                    });
                }
                
                res.json({
                    success: true,
                    user: {
                        id: session.admin_id,
                        username: session.username,
                        role: session.role
                    }
                });
            }
        );
    } else if (action === 'logout') {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        
        if (token) {
            db.run('DELETE FROM admin_sessions WHERE session_token = ?', [token]);
        }
        
        res.json({ success: true, message: 'Uitgelogd' });
    } else {
        res.status(400).json({ 
            success: false, 
            error: 'Onbekende actie' 
        });
    }
});

// Dashboard data endpoint and session verification
app.get('/admin.php', (req, res) => {
    const { dashboard, action } = req.query;
    
    if (action === 'verify') {
        // Session verification for GET requests
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                error: 'Geen token gevonden' 
            });
        }
        
        db.get(
            `SELECT s.*, u.username, u.role 
             FROM admin_sessions s 
             JOIN admin_users u ON s.admin_id = u.id 
             WHERE s.session_token = ? AND s.expires_at > datetime('now')`,
            [token],
            (err, session) => {
                if (err) {
                    console.error('Session verification error:', err);
                    return res.status(500).json({ 
                        success: false, 
                        error: 'Sessie verificatie mislukt' 
                    });
                }
                
                if (!session) {
                    return res.status(401).json({ 
                        success: false, 
                        error: 'Ongeldige of verlopen sessie' 
                    });
                }
                
                res.json({
                    success: true,
                    user: {
                        id: session.admin_id,
                        username: session.username,
                        role: session.role
                    }
                });
            }
        );
    } else if (dashboard === 'true') {
        // Return mock dashboard data
        res.json({
            success: true,
            data: {
                totalLessons: 0,
                totalReservations: 0,
                totalServices: 0,
                recentActivity: []
            }
        });
    } else {
        res.status(400).json({ 
            success: false, 
            error: 'Onbekende request' 
        });
    }
});

// Other endpoints (lessons, reservations, services) - basic stubs
app.all('/lessons.php', (req, res) => {
    const method = req.method;
    const lessonId = req.query.id;
    
    if (method === 'GET') {
        // Get all lessons from database
        db.all('SELECT * FROM lessons ORDER BY day_of_week, time', (err, rows) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ success: false, error: 'Database error' });
            }
            res.json({ success: true, data: rows });
        });
    } else if (method === 'POST') {
        // Create new lesson
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const lessonData = JSON.parse(body);
                const { id, title, time, trainer, spots, day_of_week, specific_date, description } = lessonData;
                
                db.run(
                    'INSERT INTO lessons (id, title, time, trainer, spots, day_of_week, specific_date, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [id, title, time, trainer, spots, day_of_week, specific_date, description],
                    function(err) {
                        if (err) {
                            console.error('Database error:', err);
                            return res.status(500).json({ success: false, error: 'Database error' });
                        }
                        res.json({ success: true, id: this.lastID });
                    }
                );
            } catch (error) {
                console.error('JSON parse error:', error);
                res.status(400).json({ success: false, error: 'Invalid JSON' });
            }
        });
    } else if (method === 'PUT' && lessonId) {
        // Update lesson
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const lessonData = JSON.parse(body);
                const { title, time, trainer, spots, day_of_week, specific_date, description } = lessonData;
                
                db.run(
                    'UPDATE lessons SET title = ?, time = ?, trainer = ?, spots = ?, day_of_week = ?, specific_date = ?, description = ? WHERE id = ?',
                    [title, time, trainer, spots, day_of_week, specific_date, description, lessonId],
                    function(err) {
                        if (err) {
                            console.error('Database error:', err);
                            return res.status(500).json({ success: false, error: 'Database error' });
                        }
                        res.json({ success: true, changes: this.changes });
                    }
                );
            } catch (error) {
                console.error('JSON parse error:', error);
                res.status(400).json({ success: false, error: 'Invalid JSON' });
            }
        });
    } else if (method === 'DELETE' && lessonId) {
        // Delete lesson
        db.run('DELETE FROM lessons WHERE id = ?', [lessonId], function(err) {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ success: false, error: 'Database error' });
            }
            res.json({ success: true, changes: this.changes });
        });
    } else {
        res.status(405).json({ success: false, error: 'Method not allowed' });
    }
});

app.all('/reservations.php', (req, res) => {
    // Mock reservation data for testing
    const mockReservations = [];
    res.json(mockReservations);
});

app.all('/services.php', (req, res) => {
    res.json({ success: true, data: [] });
});

// Start server
app.listen(PORT, () => {
    console.log(`Mock API server running on http://localhost:${PORT}`);
    console.log('Default admin credentials:');
    console.log('Username: rebeladmin');
    console.log('Password: rebels123');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\\nShutting down mock API server...');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err);
        } else {
            console.log('Database connection closed.');
        }
        process.exit(0);
    });
});