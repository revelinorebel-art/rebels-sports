# REBELS SPORTS - Hostinger Deployment Checklist

## 📋 Pre-Deployment Checklist

### 1. Database Setup op Hostinger
- [ ] **MySQL Database aanmaken** via Hostinger Control Panel
- [ ] **Database gebruiker aanmaken** met volledige rechten
- [ ] **Database gegevens noteren**:
  - Database naam: `_____________________`
  - Gebruikersnaam: `_____________________`
  - Wachtwoord: `_____________________`
  - Host: `_____________________` (meestal localhost)
  - Poort: `_____________________` (meestal 3306)

### 2. Database Configuratie
- [ ] **Upload `database-setup.sql`** naar Hostinger via phpMyAdmin
- [ ] **Voer SQL script uit** om tabellen aan te maken
- [ ] **Verifieer tabellen**: lessons, reservations, services, admin_users, admin_sessions
- [ ] **Test database connectie** met phpMyAdmin

### 3. API Files Upload
- [ ] **Upload alle PHP files** naar `/public_html/api/` folder:
  - `config.php`
  - `lessons.php`
  - `reservations.php`
  - `services.php`
  - `admin.php`
  - `.htaccess`

### 4. Configuratie Aanpassingen

#### A. Database Configuratie (`config.php`)
```php
// Update deze waarden met je Hostinger database gegevens
$host = 'localhost';  // Of je specifieke database host
$dbname = 'je_database_naam';
$username = 'je_database_gebruiker';
$password = 'je_database_wachtwoord';
```

#### B. CORS Instellingen
- [ ] **Update CORS origins** in `config.php` naar je live domain
- [ ] **Test CORS** vanuit je frontend

### 5. Frontend Aanpassingen

#### A. API Base URL
Update in je React components:
```javascript
// Vervang localhost URL met je live domain
const API_BASE_URL = 'https://jouwdomain.com/api';

// In plaats van:
// const API_BASE_URL = 'http://localhost/api';
```

#### B. Files die aangepast moeten worden:
- [ ] `src/components/GroepslessenPage.jsx`
- [ ] `src/components/AdminPage.jsx`
- [ ] `src/components/CalendarSection.jsx`
- [ ] `src/components/ServicesPage.jsx`

### 6. Security Checklist
- [ ] **Verander default admin wachtwoord** in database
- [ ] **Update `.htaccess`** error log path
- [ ] **Verifieer file permissions**:
  - PHP files: 644
  - Directories: 755
- [ ] **Test SQL injection protection**
- [ ] **Verifieer HTTPS** werkt correct

### 7. Testing Checklist

#### A. API Endpoints Testen
- [ ] **GET** `/api/lessons` - Haal alle lessen op
- [ ] **POST** `/api/lessons` - Maak nieuwe les aan
- [ ] **GET** `/api/reservations` - Haal reserveringen op
- [ ] **POST** `/api/reservations` - Maak nieuwe reservering
- [ ] **GET** `/api/services` - Haal services op
- [ ] **POST** `/api/admin/login` - Admin login
- [ ] **GET** `/api/admin/dashboard` - Dashboard data

#### B. Frontend Functionaliteit
- [ ] **Lessen weergeven** op groepslessen pagina
- [ ] **Reservering maken** werkt correct
- [ ] **Admin login** werkt
- [ ] **Lessen toevoegen/bewerken** in admin panel
- [ ] **Services weergeven** op services pagina
- [ ] **Week navigatie** werkt correct

### 8. Performance Optimalisatie
- [ ] **Enable Gzip compression** (via .htaccess)
- [ ] **Set cache headers** voor statische bestanden
- [ ] **Optimaliseer database queries**
- [ ] **Test laadtijden** met verschillende tools

### 9. Backup & Monitoring
- [ ] **Setup automatische database backups** via Hostinger
- [ ] **Configureer error logging**
- [ ] **Test error handling** in API
- [ ] **Monitor disk space** gebruik

### 10. Go-Live Checklist
- [ ] **DNS instellingen** correct geconfigureerd
- [ ] **SSL certificaat** geïnstalleerd en werkend
- [ ] **Alle links** werken correct
- [ ] **Contact formulieren** werken
- [ ] **Google Analytics** (indien gewenst) geconfigureerd

## 🚀 Deployment Stappen

### Stap 1: Database Setup
1. Log in op Hostinger Control Panel
2. Ga naar "Databases" → "MySQL Databases"
3. Maak nieuwe database aan
4. Maak database gebruiker aan
5. Koppel gebruiker aan database met alle rechten

### Stap 2: Database Import
1. Open phpMyAdmin via Hostinger Control Panel
2. Selecteer je database
3. Ga naar "Import" tab
4. Upload `database-setup.sql`
5. Klik "Go" om te importeren

### Stap 3: Files Upload
1. Open File Manager in Hostinger Control Panel
2. Navigeer naar `public_html`
3. Maak `api` folder aan
4. Upload alle PHP files naar `api` folder
5. Zet juiste file permissions

### Stap 4: Configuratie
1. Edit `config.php` met je database gegevens
2. Test database connectie
3. Update frontend API URLs
4. Test alle functionaliteiten

### Stap 5: Testing
1. Test alle API endpoints
2. Test frontend functionaliteiten
3. Verifieer admin panel werkt
4. Test reservering systeem

## 🔧 Troubleshooting

### Veelvoorkomende Problemen

#### Database Connectie Fout
- Controleer database gegevens in `config.php`
- Verifieer database gebruiker rechten
- Check of database host correct is

#### CORS Errors
- Update CORS origins in `config.php`
- Verifieer `.htaccess` CORS headers
- Check browser developer tools

#### 500 Internal Server Error
- Check error logs in Hostinger Control Panel
- Verifieer PHP syntax
- Controleer file permissions

#### API Endpoints Niet Bereikbaar
- Verifieer `.htaccess` rewrite rules
- Check of mod_rewrite enabled is
- Test direct PHP file access

## 📞 Support

Als je problemen ondervindt:
1. Check Hostinger documentatie
2. Gebruik Hostinger live chat support
3. Controleer error logs in Control Panel
4. Test stap voor stap volgens deze checklist

## 🎯 Success Criteria

Je deployment is succesvol als:
- ✅ Alle lessen worden correct weergegeven
- ✅ Reserveringen kunnen gemaakt worden
- ✅ Admin panel is toegankelijk
- ✅ Services pagina toont alle diensten
- ✅ Geen JavaScript errors in browser console
- ✅ Alle API calls werken correct
- ✅ Website laadt snel (< 3 seconden)

---

**Veel succes met je deployment! 🚀**