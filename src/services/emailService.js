import emailjs from '@emailjs/browser';

// EmailJS configuratie - gebruik environment variables
const EMAILJS_CONFIG = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'YOUR_SERVICE_ID',
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'YOUR_TEMPLATE_ID',
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'YOUR_PUBLIC_KEY'
};

// Initialiseer EmailJS
emailjs.init(EMAILJS_CONFIG.publicKey);

/**
 * Verzend inschrijfbevestiging email
 * @param {Object} registrationData - De inschrijfgegevens
 * @returns {Promise} - EmailJS promise
 */
export const sendRegistrationEmail = async (registrationData) => {
  try {
    const templateParams = {
      to_name: registrationData.name,
      to_email: registrationData.email,
      class_name: registrationData.className,
      class_date: registrationData.classDate,
      class_time: registrationData.classTime,
      registration_date: new Date().toLocaleDateString('nl-NL'),
      gym_name: 'Rebels Sports',
      gym_email: 'info@rebelssports.nl', // Vervang met jouw gym email
      gym_phone: '+31 6 12345678' // Vervang met jouw telefoonnummer
    };

    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams
    );

    console.log('Email verzonden succesvol:', response);
    return response;
  } catch (error) {
    console.error('Fout bij verzenden email:', error);
    throw error;
  }
};

/**
 * Verzend notificatie naar gym eigenaar
 * @param {Object} registrationData - De inschrijfgegevens
 * @returns {Promise} - EmailJS promise
 */
export const sendOwnerNotification = async (registrationData) => {
  try {
    const templateParams = {
      customer_name: registrationData.name,
      customer_email: registrationData.email,
      class_name: registrationData.className,
      class_date: registrationData.classDate,
      class_time: registrationData.classTime,
      registration_date: new Date().toLocaleDateString('nl-NL'),
      registration_time: new Date().toLocaleTimeString('nl-NL')
    };

    // Je kunt een apart template maken voor eigenaar notificaties
    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      'owner_notification_template', // Maak een apart template voor eigenaar
      templateParams
    );

    console.log('Eigenaar notificatie verzonden:', response);
    return response;
  } catch (error) {
    console.error('Fout bij verzenden eigenaar notificatie:', error);
    throw error;
  }
};