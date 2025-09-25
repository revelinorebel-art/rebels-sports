# 🚀 Hostinger Deployment Instructies

## ⚠️ BELANGRIJK: Veilige Database Configuratie

### Wat NIET te doen:
- ❌ Upload NOOIT de `.env` file naar Hostinger
- ❌ Laat NOOIT database credentials in hoofdcode staan

### Wat WEL te doen:

#### 1. Database Configuratie (Geen Environment Variables nodig)
De database configuratie staat nu in een beveiligde `db-config.php` file die:
- ✅ Automatisch wordt beveiligd door `.htaccess`
- ✅ Niet direct toegankelijk is via de browser
- ✅ Alleen door PHP scripts kan worden gelezen

**Geen extra configuratie nodig in Hostinger!**

#### 2. Upload bestanden naar Hostinger
Upload de volgende mappen/bestanden naar `public_html`:

**✅ Upload deze bestanden:**
- Hele `dist/` folder → naar `public_html/`
- Hele `api-implementation/` folder → naar `public_html/api-implementation/`

**❌ Upload deze bestanden NIET:**
- `.env` file
- `node_modules/` folder
- `src/` folder
- Development bestanden

#### 3. Bestandsstructuur op Hostinger
```
public_html/
├── index.html                    (uit dist/)
├── assets/                       (uit dist/)
├── .htaccess                     (uit dist/)
├── booking-widget.js             (uit dist/)
├── trainers/                     (uit dist/)
└── api-implementation/
    ├── .htaccess
    ├── admin.php
    ├── config.php
    ├── lessons.php
    ├── reservations.php
    └── services.php
```

#### 4. Test de website
1. Ga naar je website URL
2. Test de admin login: `/admin`
   - Username: `rebeladmin`
   - Password: `rebels123`

#### 5. Troubleshooting
Als je database errors krijgt:
1. Controleer of environment variables correct zijn ingesteld
2. Controleer database credentials in Hostinger panel
3. Kijk in error logs voor specifieke foutmeldingen

## 🔒 Beveiligingstips
- Verander het admin wachtwoord na eerste login
- Gebruik sterke wachtwoorden
- Houd je Hostinger account veilig
- Monitor regelmatig voor ongebruikelijke activiteit

## 📞 Support
Bij problemen, controleer eerst:
1. Environment variables in Hostinger
2. Database verbinding
3. File permissions
4. Error logs