# EmailJS Setup Instructies voor Rebels Sports

## Stap 1: EmailJS Account Aanmaken

1. Ga naar [https://www.emailjs.com/](https://www.emailjs.com/)
2. Maak een gratis account aan
3. Verifieer je email adres

## Stap 2: Email Service Configureren

1. Log in op je EmailJS dashboard
2. Ga naar "Email Services"
3. Klik op "Add New Service"
4. Kies je email provider (Gmail, Outlook, etc.)
5. Volg de instructies om je email account te verbinden
6. Noteer je **Service ID**

## Stap 3: Email Templates Maken

### Template 1: Klant Bevestiging
1. Ga naar "Email Templates"
2. Klik op "Create New Template"
3. Gebruik deze template:

**Subject:** Bevestiging inschrijving - {{class_name}}

**Content:**
```
Hallo {{to_name}},

Bedankt voor je inschrijving bij {{gym_name}}!

Hier zijn je inschrijfgegevens:
- Les: {{class_name}}
- Datum: {{class_date}}
- Tijd: {{class_time}}
- Inschrijfdatum: {{registration_date}}

We kijken ernaar uit je te zien in de les!

Met sportieve groeten,
Het {{gym_name}} team

Contact:
Email: {{gym_email}}
Telefoon: {{gym_phone}}
```

4. Sla op en noteer de **Template ID**

### Template 2: Eigenaar Notificatie
1. Maak een tweede template met ID: `owner_notification_template`
2. Gebruik deze template:

**Subject:** Nieuwe inschrijving - {{class_name}}

**Content:**
```
Er is een nieuwe inschrijving binnengekomen:

Klant: {{customer_name}}
Email: {{customer_email}}
Les: {{class_name}}
Datum: {{class_date}}
Tijd: {{class_time}}
Inschrijfdatum: {{registration_date}} om {{registration_time}}
```

## Stap 4: Public Key Verkrijgen

1. Ga naar "Account" in je EmailJS dashboard
2. Kopieer je **Public Key**

## Stap 5: Configuratie Updaten

Open het bestand `src/services/emailService.js` en vervang:

```javascript
const EMAILJS_CONFIG = {
  serviceId: 'YOUR_SERVICE_ID', // Vervang met jouw Service ID
  templateId: 'YOUR_TEMPLATE_ID', // Vervang met jouw Template ID voor klanten
  publicKey: 'YOUR_PUBLIC_KEY' // Vervang met jouw Public Key
};
```

## Stap 6: Testen

1. Start je development server: `npm run dev`
2. Ga naar de groepslessen pagina
3. Probeer je in te schrijven voor een les
4. Controleer of je de bevestigingsmail ontvangt

## Troubleshooting

### Emails komen niet aan
- Controleer je spam/junk folder
- Verifieer dat je email service correct is geconfigureerd
- Controleer de browser console voor error berichten

### Template errors
- Zorg dat alle variabelen in je template overeenkomen met de templateParams
- Controleer dat je Template ID correct is

### Service errors
- Verifieer je Service ID en Public Key
- Controleer of je email service actief is in EmailJS

## Kosten

EmailJS heeft een gratis tier met:
- 200 emails per maand
- Basis support

Voor meer emails kun je upgraden naar een betaald plan.

## Beveiliging

- Deel je Private Key NOOIT in je frontend code
- De Public Key is veilig om te gebruiken in frontend applicaties
- EmailJS heeft ingebouwde spam bescherming