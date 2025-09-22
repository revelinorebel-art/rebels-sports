# 🏋️ Rebels Sports Website

Een moderne, responsieve website voor Rebels Sports - jouw ultieme fitness en sportschool ervaring.

## 🚀 Features

- **Moderne UI/UX**: Gebouwd met React en Tailwind CSS
- **Responsief Design**: Werkt perfect op alle apparaten
- **Groepslessen Systeem**: Volledige les management en inschrijvingen
- **Admin Panel**: Beheer lessen, inschrijvingen en gebruikers
- **Email Notificaties**: Automatische bevestigingen via EmailJS
- **Real-time Updates**: Live updates van beschikbare plekken
- **Rooster Weergave**: Overzichtelijke weekplanning

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + Lucide React
- **Routing**: React Router DOM
- **Animations**: Framer Motion
- **Email Service**: EmailJS
- **Build Tool**: Vite
- **Package Manager**: NPM

## 📋 Vereisten

- Node.js 20.19.1 of hoger
- NPM of Yarn

## 🔧 Installatie

1. **Clone de repository**
   ```bash
   git clone https://github.com/jouw-username/rebels-sports-website.git
   cd rebels-sports-website
   ```

2. **Installeer dependencies**
   ```bash
   npm install
   ```

3. **Environment variabelen instellen**
   ```bash
   cp .env.example .env
   ```
   
   Vul de volgende variabelen in je `.env` bestand:
   ```env
   VITE_EMAILJS_SERVICE_ID=jouw_emailjs_service_id
   VITE_EMAILJS_TEMPLATE_ID=jouw_emailjs_template_id
   VITE_EMAILJS_PUBLIC_KEY=jouw_emailjs_public_key
   VITE_ADMIN_USERNAME=admin
   VITE_ADMIN_PASSWORD=jouw_veilige_wachtwoord
   ```

4. **Start de development server**
   ```bash
   npm run dev
   ```

   De website is nu beschikbaar op `http://localhost:5175`

## 🏗️ Build voor Productie

```bash
npm run build
```

De build bestanden worden gegenereerd in de `dist/` map.

## 📁 Project Structuur

```
src/
├── components/          # Herbruikbare UI componenten
│   ├── ui/             # Basis UI componenten
│   ├── CalendarSection.jsx
│   ├── AdminPanel.jsx
│   └── ...
├── pages/              # Pagina componenten
│   ├── HomePage.jsx
│   ├── AdminPage.jsx
│   ├── GroepslessenPage.jsx
│   └── ...
├── services/           # API en service functies
│   └── emailService.js
├── lib/                # Utility functies
└── App.jsx            # Hoofd app component
```

## 🔐 Admin Panel

Het admin panel is toegankelijk via `/admin` en biedt:

- **Lessen Beheren**: Toevoegen, bewerken en verwijderen van groepslessen
- **Inschrijvingen Beheren**: Overzicht en beheer van alle inschrijvingen
- **Real-time Statistics**: Live overzicht van beschikbare plekken

**Standaard login**: 
- Username: `admin`
- Password: Zie environment variabelen

## 📧 Email Configuratie

Voor email notificaties gebruik je EmailJS:

1. Maak een account aan op [EmailJS](https://www.emailjs.com/)
2. Stel een email service in
3. Maak een email template aan
4. Voeg je credentials toe aan de `.env` file

## 🎨 Styling

Het project gebruikt Tailwind CSS voor styling. Belangrijke configuraties:

- **Kleuren**: Custom color palette in `tailwind.config.js`
- **Responsive**: Mobile-first approach
- **Dark Mode**: Ondersteuning voor dark/light themes
- **Animations**: Framer Motion voor smooth transitions

## 📱 Features Overzicht

### Voor Gebruikers
- Bekijk groepslessen schema
- Inschrijven voor lessen
- Contact formulier
- Membership informatie

### Voor Beheerders
- Volledige les management
- Inschrijvingen beheer
- Real-time updates
- Email notificaties

## 🚀 Deployment

### Hostinger Deployment
Zie `HOSTINGER_MIGRATION_GUIDE.md` voor gedetailleerde instructies.

### Andere Platforms
Het project kan gedeployed worden op:
- Vercel
- Netlify
- GitHub Pages
- Elke static hosting service

## 🤝 Contributing

1. Fork het project
2. Maak een feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit je changes (`git commit -m 'Add some AmazingFeature'`)
4. Push naar de branch (`git push origin feature/AmazingFeature`)
5. Open een Pull Request

## 📄 License

Dit project is gelicenseerd onder de MIT License - zie het [LICENSE](LICENSE) bestand voor details.

## 📞 Contact

Voor vragen of ondersteuning:
- Website: [Rebels Sports](https://jouw-website.com)
- Email: info@rebelssports.com

## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [EmailJS](https://www.emailjs.com/)

---

**Gemaakt met ❤️ voor Rebels Sports**