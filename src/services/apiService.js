// API Service voor Rebels Sports
// Vervangt localStorage calls met database API calls

const API_BASE = 'http://localhost:8080';

// Mock data store voor persistente data tijdens ontwikkeling
class MockDataStore {
  constructor() {
    this.initializeData();
  }

  initializeData() {
    // Initialiseer lessen als ze nog niet bestaan
    if (!localStorage.getItem('mockLessons')) {
      const initialLessons = [
        {
          id: 1,
          title: 'Kickboksen Beginners',
          time: '18:00',
          trainer: 'Mike Johnson',
          spots: 15,
          day_of_week: 1,
          specific_date: null,
          description: 'Perfecte les voor beginners in kickboksen. Leer de basis technieken en verbeter je conditie.',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          title: 'CrossFit Advanced',
          time: '19:30',
          trainer: 'Sarah Wilson',
          spots: 12,
          day_of_week: 2,
          specific_date: null,
          description: 'Intensieve CrossFit training voor gevorderden. Uitdagende workouts en functionele bewegingen.',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 3,
          title: 'Yoga Flow',
          time: '10:30',
          trainer: 'Emma Davis',
          spots: 20,
          day_of_week: 3,
          specific_date: null,
          description: 'Ontspannende yoga sessie met focus op flexibiliteit en mindfulness.',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      localStorage.setItem('mockLessons', JSON.stringify(initialLessons));
    }

    // Initialiseer reserveringen als ze nog niet bestaan
    if (!localStorage.getItem('mockReservations')) {
      localStorage.setItem('mockReservations', JSON.stringify([]));
    }
  }

  getLessons() {
    return JSON.parse(localStorage.getItem('mockLessons') || '[]');
  }

  saveLessons(lessons) {
    localStorage.setItem('mockLessons', JSON.stringify(lessons));
    // Trigger een custom event voor real-time synchronisatie
    window.dispatchEvent(new CustomEvent('lessonsUpdated', { detail: lessons }));
  }

  getReservations() {
    return JSON.parse(localStorage.getItem('mockReservations') || '[]');
  }

  saveReservations(reservations) {
    localStorage.setItem('mockReservations', JSON.stringify(reservations));
    // Trigger een custom event voor real-time synchronisatie
    window.dispatchEvent(new CustomEvent('reservationsUpdated', { detail: reservations }));
  }

  addLesson(lesson) {
    const lessons = this.getLessons();
    const newLesson = {
      ...lesson,
      id: Date.now(), // Gebruik timestamp als unieke ID
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    lessons.push(newLesson);
    this.saveLessons(lessons);
    return newLesson;
  }

  updateLesson(id, lessonData) {
    const lessons = this.getLessons();
    const index = lessons.findIndex(lesson => lesson.id == id);
    if (index !== -1) {
      lessons[index] = {
        ...lessons[index],
        ...lessonData,
        updated_at: new Date().toISOString()
      };
      this.saveLessons(lessons);
      return lessons[index];
    }
    return null;
  }

  deleteLesson(id) {
    const lessons = this.getLessons();
    const filteredLessons = lessons.filter(lesson => lesson.id != id);
    this.saveLessons(filteredLessons);
    
    // Verwijder ook gerelateerde reserveringen
    const reservations = this.getReservations();
    const filteredReservations = reservations.filter(res => res.classId != id);
    this.saveReservations(filteredReservations);
    
    return true;
  }

  addReservation(reservation) {
    const reservations = this.getReservations();
    const lessons = this.getLessons();
    
    // Zoek de les om capaciteit te controleren
    const lesson = lessons.find(l => l.id === reservation.lesson_id);
    if (!lesson) {
      throw new Error('Les niet gevonden');
    }
    
    // Tel huidige reserveringen voor deze les en datum
    const existingReservations = reservations.filter(r => 
      r.lesson_id === reservation.lesson_id && 
      r.lesson_date === reservation.lesson_date
    );
    
    // Controleer of er nog plek is
    if (existingReservations.length >= lesson.spots) {
      throw new Error('Deze les is vol');
    }
    
    const newReservation = {
      ...reservation,
      id: Date.now(),
      created_at: new Date().toISOString()
    };
    reservations.push(newReservation);
    this.saveReservations(reservations);
    
    // Trigger event voor real-time synchronisatie
    window.dispatchEvent(new CustomEvent('reservationsUpdated'));
    
    return newReservation;
  }

  deleteReservation(id) {
    const reservations = this.getReservations();
    const filteredReservations = reservations.filter(res => res.id != id);
    this.saveReservations(filteredReservations);
    
    // Trigger event voor real-time synchronisatie
    window.dispatchEvent(new CustomEvent('reservationsUpdated'));
    
    return true;
  }

  clearAllData() {
    localStorage.removeItem('mockLessons');
    localStorage.removeItem('mockReservations');
    this.initializeData();
  }
}

const mockDataStore = new MockDataStore();

class ApiService {
  constructor() {
    this.baseURL = API_BASE;
    this.mockStore = mockDataStore;
  }

  // Helper method voor API calls
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}/${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const config = { ...defaultOptions, ...options };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP error! status: ${response.status}`,
          data: null
        };
      }

      // Check if the response data contains an error field
      if (data && typeof data === 'object' && data.error) {
        return {
          success: false,
          error: data.error,
          data: null
        };
      }

      // Handle different response structures
      // Live API wraps arrays in 'value' property, mock API returns arrays directly
      let responseData = data;
      if (data && typeof data === 'object' && data.value && Array.isArray(data.value)) {
        responseData = data.value;
      }

      // Wrap successful responses in consistent format
      return {
        success: true,
        data: responseData,
        error: null
      };
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      return {
        success: false,
        error: error.message || 'Network error',
        data: null
      };
    }
  }

  // ===== LESSEN API =====
  
  async getLessons() {
    // Gebruik persistente mock data store
    console.log('Ophalen van lessen uit mock data store');
    
    const lessons = this.mockStore.getLessons();
    
    return {
      success: true,
      data: lessons,
      error: null
    };
  }

  async createLesson(lessonData) {
    // Gebruik mock data store voor persistente opslag
    console.log('Toevoegen van les aan mock data store', lessonData);
    
    try {
      const newLesson = this.mockStore.addLesson(lessonData);
      
      return {
        success: true,
        data: newLesson,
        error: null
      };
    } catch (error) {
      console.error('Fout bij toevoegen van les:', error);
      return {
        success: false,
        data: null,
        error: 'Kon les niet toevoegen'
      };
    }
  }

  async updateLesson(lessonId, lessonData) {
    // Gebruik mock data store voor persistente opslag
    console.log('Bijwerken van les in mock data store', lessonId, lessonData);
    
    try {
      const updatedLesson = this.mockStore.updateLesson(lessonId, lessonData);
      
      if (updatedLesson) {
        return {
          success: true,
          data: updatedLesson,
          error: null
        };
      } else {
        return {
          success: false,
          data: null,
          error: 'Les niet gevonden'
        };
      }
    } catch (error) {
      console.error('Fout bij bijwerken van les:', error);
      return {
        success: false,
        data: null,
        error: 'Kon les niet bijwerken'
      };
    }
  }

  async deleteLesson(lessonId) {
    // Gebruik mock data store voor persistente opslag
    console.log('Verwijderen van les uit mock data store', lessonId);
    
    try {
      const success = this.mockStore.deleteLesson(lessonId);
      
      if (success) {
        return {
          success: true,
          data: { message: 'Les succesvol verwijderd' },
          error: null
        };
      } else {
        return {
          success: false,
          data: null,
          error: 'Les niet gevonden'
        };
      }
    } catch (error) {
      console.error('Fout bij verwijderen van les:', error);
      return {
        success: false,
        data: null,
        error: 'Kon les niet verwijderen'
      };
    }
  }

  // ===== RESERVERINGEN API =====
  
  async getReservations(lessonId = null, date = null) {
    // Gebruik mock data store voor persistente opslag
    console.log('Ophalen van reserveringen uit mock data store', { lessonId, date });
    
    try {
      let reservations = this.mockStore.getReservations();
      
      // Filter op lessonId als opgegeven
      if (lessonId) {
        reservations = reservations.filter(res => res.lesson_id == lessonId);
      }
      
      // Filter op datum als opgegeven
      if (date) {
        reservations = reservations.filter(res => res.lesson_date === date);
      }
      
      return {
        success: true,
        data: reservations,
        error: null
      };
    } catch (error) {
      console.error('Fout bij ophalen van reserveringen:', error);
      return {
        success: false,
        data: [],
        error: 'Kon reserveringen niet ophalen'
      };
    }
  }

  async createReservation(reservationData) {
    // Gebruik mock data store voor persistente opslag
    console.log('Toevoegen van reservering aan mock data store', reservationData);
    
    try {
      const newReservation = this.mockStore.addReservation(reservationData);
      
      return {
        success: true,
        data: newReservation,
        error: null
      };
    } catch (error) {
      console.error('Fout bij toevoegen van reservering:', error);
      return {
        success: false,
        data: null,
        error: error.message || 'Kon reservering niet toevoegen'
      };
    }
  }

  async deleteReservation(reservationId) {
    // Gebruik mock data store voor persistente opslag
    console.log('Verwijderen van reservering uit mock data store', reservationId);
    
    try {
      const success = this.mockStore.deleteReservation(reservationId);
      
      if (success) {
        return {
          success: true,
          data: { message: 'Reservering succesvol verwijderd' },
          error: null
        };
      } else {
        return {
          success: false,
          data: null,
          error: 'Reservering niet gevonden'
        };
      }
    } catch (error) {
      console.error('Fout bij verwijderen van reservering:', error);
      return {
        success: false,
        data: null,
        error: 'Kon reservering niet verwijderen'
      };
    }
  }

  // ===== SERVICES API =====
  
  async getServices() {
    return this.makeRequest('services.php');
  }

  // ===== ADMIN API =====
  
  async adminLogin(username, password) {
    // Mock implementatie voor lokale ontwikkeling
    console.log('Mock: Admin login attempt', username);
    
    if (username === 'admin' && password === 'admin123') {
      const mockToken = 'mock-admin-token-' + Date.now();
      localStorage.setItem('adminToken', mockToken);
      return {
        success: true,
        data: { 
          token: mockToken,
          message: 'Succesvol ingelogd',
          admin: { username: 'admin', id: 1, email: 'admin@rebelssports.nl' }
        },
        error: null
      };
    } else {
      return {
        success: false,
        error: 'Ongeldige inloggegevens',
        data: null
      };
    }
  }

  async adminLogout() {
    // Mock implementatie voor lokale ontwikkeling
    console.log('Mock: Admin logout');
    
    // Verwijder het token uit localStorage
    localStorage.removeItem('adminToken');
    
    return {
      success: true,
      data: { message: 'Succesvol uitgelogd' },
      error: null
    };
  }

  async checkAdminAuth() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      return { success: false, error: 'Geen token gevonden' };
    }

    // Mock implementatie voor lokale ontwikkeling
    console.log('Mock: Verifying admin token', token);
    
    // Simuleer een succesvolle verificatie
    return {
      success: true,
      data: {
        valid: true,
        admin: {
          id: 1,
          username: 'admin',
          email: 'admin@rebelssports.nl'
        }
      },
      error: null
    };
  }

  // Functie om alle data te wissen voor testing
  async clearAllData() {
    console.log('Wissen van alle mock data voor testing');
    
    try {
      this.mockStore.clearAllData();
      
      return {
        success: true,
        data: { message: 'Alle data succesvol gewist' },
        error: null
      };
    } catch (error) {
      console.error('Fout bij wissen van data:', error);
      return {
        success: false,
        data: null,
        error: 'Kon data niet wissen'
      };
    }
  }

  async verifyAdmin() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      return { success: false, error: 'Geen token gevonden' };
    }

    // Mock implementatie voor lokale ontwikkeling
    console.log('Mock: Verifying admin token', token);
    
    // Simuleer een succesvolle verificatie
    return {
      success: true,
      data: {
        valid: true,
        admin: {
          id: 1,
          username: 'admin',
          email: 'admin@rebelssports.nl'
        }
      },
      error: null
    };
  }

  async getDashboardData() {
    return this.makeRequest('admin.php?dashboard=true');
  }

  // ===== HELPER METHODS =====
  
  // Converteer frontend lesson format naar database format
  formatLessonForDatabase(lesson) {
    // Bereken de dag van de week uit de specifieke datum als die beschikbaar is
    let dayOfWeek = 0;
    if (lesson.date) {
      const date = new Date(lesson.date);
      dayOfWeek = date.getDay(); // 0 = Zondag, 1 = Maandag, etc.
    } else if (lesson.day !== undefined && lesson.day !== null) {
      dayOfWeek = parseInt(lesson.day);
    }
    
    // Zorg ervoor dat dayOfWeek altijd een geldige waarde heeft (0-6)
    if (isNaN(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
      dayOfWeek = 0; // Default to Sunday (0)
    }
    
    const result = {
      id: lesson.id,
      title: lesson.name || lesson.title, // Ondersteun beide veldnamen
      trainer: lesson.trainer,
      time: lesson.time,
      spots: parseInt(lesson.spots) || 15,
      day_of_week: dayOfWeek, // Gebruik de berekende dag van de week
      specific_date: lesson.date || null, // Gebruik de specifieke datum
      description: lesson.description || '',
    };
    
    console.log(`[DATE-BASED LESSON] Saving lesson for date: ${lesson.date}, day: ${dayOfWeek}`);
    console.log('Formatting lesson for database:', lesson, 'Day:', dayOfWeek, 'Date:', lesson.date);
    console.log('Formatted lesson for database:', result);
    
    return result;
  }

  // Converteer database lesson format naar frontend format
  formatLessonForFrontend(lesson) {
    console.log('[FORMAT LESSON] Received lesson from database:', lesson);
    
    // Zorg ervoor dat we de juiste veldnamen gebruiken
    const name = lesson.name || lesson.title;
    const specificDate = lesson.specific_date || lesson.date;
    
    // Bereken de dag van de week uit de specifieke datum
    let dayValue = null;
    if (specificDate) {
      const date = new Date(specificDate);
      dayValue = date.getDay(); // 0 = Zondag, 1 = Maandag, etc.
    } else if (lesson.day_of_week !== undefined && lesson.day_of_week !== null) {
      dayValue = parseInt(lesson.day_of_week);
    } else if (lesson.day !== undefined && lesson.day !== null) {
      dayValue = parseInt(lesson.day);
    } else {
      dayValue = 0; // Default to Sunday (0)
    }
    
    // Zorg ervoor dat dayValue altijd een geldige waarde heeft (0-6)
    if (isNaN(dayValue) || dayValue < 0 || dayValue > 6) {
      dayValue = 0; // Default to Sunday (0)
    }
    
    const result = {
      id: lesson.id,
      name: name,
      title: name, // Voor compatibiliteit met oudere code
      time: lesson.time,
      trainer: lesson.trainer,
      spots: parseInt(lesson.spots) || 15,
      day: dayValue,
      date: specificDate,
      specific_date: specificDate, // Voor compatibiliteit met oudere code
      description: lesson.description || '',
      location: lesson.location || 'Rebels Sports',
      price: lesson.price || 0,
      image: lesson.image || 'Een generieke fitness les'
    };
    
    return result;
  }

  // Converteer localStorage reservering naar database format
  formatReservationForDatabase(registration) {
    return {
      lesson_id: registration.classId || registration.lesson_id,
      lesson_date: registration.classDate || registration.lesson_date,
      participant_name: registration.name || registration.participant_name,
      participant_email: registration.email || registration.participant_email,
      participant_phone: registration.phone || registration.participant_phone || '',
      notes: registration.notes || ''
    };
  }

  // ===== MIGRATION HELPERS =====
  
  // Migreer localStorage lessen naar database
  async migrateLessonsFromLocalStorage() {
    try {
      const storedLessons = localStorage.getItem('rebelsClasses');
      if (!storedLessons) return { success: true, message: 'Geen lessen om te migreren' };

      const lessons = JSON.parse(storedLessons);
      const results = [];

      for (const lesson of lessons) {
        try {
          const formattedLesson = this.formatLessonForDatabase(lesson);
          const result = await this.createLesson(formattedLesson);
          results.push({ lesson: lesson.title, success: true, result });
        } catch (error) {
          results.push({ lesson: lesson.title, success: false, error: error.message });
        }
      }

      return { success: true, results };
    } catch (error) {
      console.error('Migratie fout:', error);
      return { success: false, error: error.message };
    }
  }

  // Migreer localStorage reserveringen naar database
  async migrateReservationsFromLocalStorage() {
    try {
      const storedRegistrations = localStorage.getItem('rebelsRegistrations');
      if (!storedRegistrations) return { success: true, message: 'Geen reserveringen om te migreren' };

      const registrations = JSON.parse(storedRegistrations);
      const results = [];

      for (const registration of registrations) {
        try {
          const formattedReservation = this.formatReservationForDatabase(registration);
          const result = await this.createReservation(formattedReservation);
          results.push({ registration: registration.name, success: true, result });
        } catch (error) {
          results.push({ registration: registration.name, success: false, error: error.message });
        }
      }

      return { success: true, results };
    } catch (error) {
      console.error('Migratie fout:', error);
      return { success: false, error: error.message };
    }
  }
}

// Singleton instance
const apiService = new ApiService();

export default apiService;

// Named exports voor specifieke functies
export const {
  getLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  getReservations,
  createReservation,
  deleteReservation,
  getServices,
  adminLogin,
  adminLogout,
  checkAdminAuth,
  getDashboardData,
  migrateLessonsFromLocalStorage,
  migrateReservationsFromLocalStorage
} = apiService;