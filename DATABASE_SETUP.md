# REBELS SPORTS - Database Setup Guide

## Probleem Opgelost ✅

Het "Database connectie mislukt" probleem was veroorzaakt door het ontbreken van een `.env` bestand met de juiste database credentials.

## Wat er is gefixt:

1. **`.env` bestand toegevoegd** met de Hostinger database credentials
2. **Database configuratie** in `config.php` leest nu correct de environment variabelen
3. **Nieuwe build** gemaakt met de juiste configuratie

## Database Setup voor Live Server

### Stap 1: Upload bestanden naar Hostinger

Upload de volgende bestanden naar je Hostinger public_html directory:

```
dist/
├── index.html
├── assets/
├── .env                    # ← BELANGRIJK!
├── .htaccess
├── admin.php
├── config.php
├── lessons.php
├── reservations.php
├── services.php
└── database-setup.sql
```

### Stap 2: Database tabellen aanmaken

1. Log in op je Hostinger control panel
2. Ga naar "Databases" → "phpMyAdmin"
3. Selecteer database: `u130570185_rebelssports`
4. Voer de SQL uit uit `database-setup.sql`:

```sql
-- Kopieer en plak de inhoud van database-setup.sql
-- Dit maakt alle benodigde tabellen aan
```

### Stap 3: Controleer database credentials

Zorg ervoor dat de `.env` file de juiste credentials bevat:

```env
DB_HOST=srv1568.hstgr.io
DB_NAME=u130570185_rebelssports
DB_USERNAME=u130570185_rebeldata
DB_PASSWORD=&eNfu4es>zQ3
DB_PORT=3306
```

### Stap 4: Test de admin login

1. Ga naar `https://jouwdomain.com/admin`
2. Probeer in te loggen met:
   - **Username:** `rebeladmin`
   - **Password:** `rebels123`

## Standaard Admin Account

Het database setup script maakt automatisch een admin account aan:
- **Username:** `rebeladmin`
- **Password:** `rebels123`
- **Email:** `admin@rebelssports.nl`

⚠️ **BELANGRIJK:** Verander dit wachtwoord na de eerste login!

## Troubleshooting

### "Database connectie mislukt"
- Controleer of `.env` bestand bestaat en de juiste credentials bevat
- Controleer of de database tabellen zijn aangemaakt
- Controleer Hostinger database status

### "Admin niet gevonden"
- Voer het database setup script opnieuw uit
- Controleer of de `admin_users` tabel bestaat

### API endpoints werken niet
- Controleer `.htaccess` configuratie
- Controleer of alle PHP bestanden zijn geüpload
- Controleer PHP error logs in Hostinger

## Database Schema

### Tabellen:
- `admin_users` - Admin gebruikers en authenticatie
- `admin_sessions` - Sessie management
- `lessons` - Groepslessen
- `reservations` - Reserveringen voor lessen
- `services` - Services/diensten

### Belangrijke features:
- Automatische UUID generatie voor lessons
- Session-based authenticatie voor admins
- CORS headers voor frontend communicatie
- UTF-8 support voor Nederlandse tekst

## Beveiliging

- Wachtwoorden worden gehashed met `password_hash()`
- Session tokens voor veilige authenticatie
- Input sanitization en validation
- CORS configuratie
- `.env` bestand beveiligd via `.htaccess`

## Onderhoud

### Sessie cleanup
Voer regelmatig uit om oude sessies op te ruimen:
```sql
DELETE FROM admin_sessions WHERE expires_at < NOW();
```

### Backup
Maak regelmatig backups van de database via Hostinger control panel.