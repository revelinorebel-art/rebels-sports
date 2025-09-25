// API Service voor Rebels Sports
// Vervangt localStorage calls met database API calls

// Force HTTPS API URL for production to prevent 301 redirects
const API_BASE = 'https://red-seal-316406.hostingersite.com/api-implementation';

// Productie configuratie - altijd live API gebruiken
const isDevelopment = false;
const isLocalhost = false;



class ApiService {
  constructor() {
    this.baseUrl = API_BASE;
  }

  // Helper method voor API calls
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
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
    console.log('Ophalen van lessen uit database via API...');
    
    const response = await this.makeRequest('/lessons.php', {
      method: 'GET'
    });
    
    if (response.success && response.data) {
      // Handle different response formats from the API
      let lessonsArray = [];
      
      if (response.data.lessons && Array.isArray(response.data.lessons)) {
        // API returns lessons in a 'lessons' property
        lessonsArray = response.data.lessons;
      } else if (Array.isArray(response.data)) {
        // API returns lessons directly as array
        lessonsArray = response.data;
      } else if (response.data.value && Array.isArray(response.data.value)) {
        // API returns lessons in a 'value' property
        lessonsArray = response.data.value;
      }
      
      // Converteer database format naar frontend format
      const lessons = lessonsArray.map(lesson => this.formatLessonForFrontend(lesson));
      
      console.log(`${lessons.length} lessen opgehaald uit database`);
      console.log('Raw API response:', response.data);
      console.log('Formatted lessons:', lessons);
      
      return {
        success: true,
        data: lessons,
        error: null
      };
    } else {
      console.error('API response error:', response);
      return {
        success: false,
        error: response.error || 'Fout bij ophalen lessen uit database',
        data: []
      };
    }
  }

  async createLesson(lessonData) {
    console.log('Toevoegen van les aan database', lessonData);
    
    // Converteer frontend format naar database format
    const dbLesson = this.formatLessonForDatabase(lessonData);
    
    const response = await this.makeRequest('/lessons.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dbLesson)
    });
    
    if (response.success) {
      // Converteer terug naar frontend format
      const newLesson = this.formatLessonForFrontend({
        ...dbLesson,
        id: response.id
      });
      
      return {
        success: true,
        data: newLesson,
        error: null
      };
    } else {
      return {
        success: false,
        error: response.error || 'Fout bij toevoegen les',
        data: null
      };
    }
  }

  async updateLesson(lessonId, lessonData) {
    try {
      console.log('Bijwerken van les in database', lessonId, lessonData);
      
      // Converteer frontend format naar database format
      const dbLesson = this.formatLessonForDatabase({
        ...lessonData,
        id: lessonId
      });
      
      const response = await this.makeRequest('/lessons.php', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dbLesson)
      });
      
      if (response.success) {
        // Converteer terug naar frontend format
        const updatedLesson = this.formatLessonForFrontend({
          ...dbLesson,
          id: lessonId
        });
        
        return {
          success: true,
          data: updatedLesson,
          error: null
        };
      } else {
        throw new Error(response.error || 'Fout bij bijwerken les');
      }
    } catch (error) {
      console.error('Fout bij bijwerken van les:', error);
      
      return {
        success: false,
        data: null,
        error: error.message || 'Fout bij bijwerken van les'
      };
    }
  }

  async deleteLesson(lessonId) {
    try {
      console.log('Verwijderen van les uit database', lessonId);
      
      const response = await this.makeRequest(`/lessons.php?id=${lessonId}`, {
        method: 'DELETE'
      });
      
      if (response.success) {
        return {
          success: true,
          data: { message: 'Les succesvol verwijderd' },
          error: null
        };
      } else {
        throw new Error(response.error || 'Fout bij verwijderen les');
      }
    } catch (error) {
      console.error('Fout bij verwijderen van les:', error);
      
      return {
        success: false,
        data: null,
        error: error.message || 'Fout bij verwijderen van les'
      };
    }
  }

  // ===== RESERVERINGEN API =====
  
  async getReservations(lessonId = null, date = null) {
    try {
      console.log('Ophalen van reserveringen uit database', { lessonId, date });
      
      // Bouw query parameters
      const params = new URLSearchParams();
      if (lessonId) params.append('lesson_id', lessonId);
      if (date) params.append('date', date);
      
      const queryString = params.toString();
      const endpoint = `/reservations.php${queryString ? '?' + queryString : ''}`;
      
      const response = await this.makeRequest(endpoint, {
        method: 'GET'
      });
      
      if (response.success) {
        return {
          success: true,
          data: response.data || response.reservations || [],
          error: null
        };
      } else {
        throw new Error(response.error || 'Fout bij ophalen reserveringen');
      }
    } catch (error) {
      console.error('Fout bij ophalen van reserveringen:', error);
      
      return {
        success: false,
        data: [],
        error: error.message || 'Fout bij ophalen van reserveringen'
      };
    }
  }

  async createReservation(reservationData) {
    try {
      console.log('Toevoegen van reservering aan database', reservationData);
      
      // Converteer frontend format naar database format
      const dbReservation = this.formatReservationForDatabase(reservationData);
      
      const response = await this.makeRequest('/reservations.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dbReservation)
      });
      
      if (response.success) {
        return {
          success: true,
          data: response.data || dbReservation,
          error: null
        };
      } else {
        throw new Error(response.error || 'Fout bij toevoegen reservering');
      }
    } catch (error) {
      console.error('Fout bij toevoegen van reservering:', error);
      
      return {
        success: false,
        data: null,
        error: error.message || 'Fout bij toevoegen van reservering'
      };
    }
  }

  async deleteReservation(reservationId) {
    try {
      console.log('Verwijderen van reservering uit database', reservationId);
      
      const response = await this.makeRequest(`/reservations.php?id=${reservationId}`, {
        method: 'DELETE'
      });
      
      if (response.success) {
        return {
          success: true,
          data: { message: 'Reservering succesvol verwijderd' },
          error: null
        };
      } else {
        throw new Error(response.error || 'Fout bij verwijderen reservering');
      }
    } catch (error) {
      console.error('Fout bij verwijderen van reservering:', error);
      
      return {
        success: false,
        data: null,
        error: error.message || 'Fout bij verwijderen van reservering'
      };
    }
  }

  // ===== SERVICES API =====
  
  async getServices() {
    return this.makeRequest('services.php');
  }

  // ===== ADMIN API =====
  
  async adminLogin(username, password) {
    console.log('Admin login attempt:', username);
    
    const response = await this.makeRequest('/admin.php?action=login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    
    if (response.success && response.data) {
      // Sla het token op in localStorage (backend geeft session_token terug)
      if (response.data.session_token) {
        localStorage.setItem('adminToken', response.data.session_token);
      }
      
      return {
        success: true,
        data: response.data,
        error: null
      };
    } else {
      return {
        success: false,
        error: response.error || 'Inloggen mislukt',
        data: null
      };
    }
  }

  async adminLogout() {
    console.log('Admin logout');
    
    const response = await this.makeRequest('/admin.php?action=logout', {
      method: 'POST'
    });
    
    // Verwijder het token uit localStorage ongeacht de API response
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

    console.log('Verifying admin token');
    
    const response = await this.makeRequest('/admin.php?action=verify', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.success && response.data) {
      return {
        success: true,
        data: response.data,
        error: null
      };
    } else {
      // Token is ongeldig, verwijder het
      localStorage.removeItem('adminToken');
      return {
        success: false,
        error: response.error || 'Token verificatie mislukt',
        data: null
      };
    }
  }

  // Functie om alle data te wissen voor testing
  async clearAllData() {
    console.log('Wissen van alle data uit database');
    
    try {
      // Voor productie: implementeer database clear functionaliteit
      const response = await this.makeRequest('/clear-data.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.success) {
        return {
          success: true,
          data: { message: 'Alle data succesvol gewist' },
          error: null
        };
      } else {
        throw new Error(response.error || 'Fout bij wissen van data');
      }
    } catch (error) {
      console.error('Fout bij wissen van data:', error);
      return {
        success: false,
        data: null,
        error: error.message || 'Kon data niet wissen'
      };
    }
  }

  async verifyAdmin() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      return { success: false, error: 'Geen token gevonden' };
    }

    try {
      const response = await this.makeRequest('/admin.php?action=verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response;
    } catch (error) {
      console.error('Fout bij verificatie admin token:', error);
      return {
        success: false,
        error: error.message || 'Fout bij verificatie'
      };
    }
  }

  async getDashboardData() {
    return this.makeRequest('admin.php?dashboard=true');
  }

  // ===== HELPER METHODS =====
  
  // Converteer frontend lesson format naar database format
  formatLessonForDatabase(lesson) {
    console.log('Formatting lesson for database:', lesson);
    
    // Bereken de dag van de week uit de specifieke datum als die beschikbaar is
    let dayOfWeek = 1;
    if (lesson.date) {
      const date = new Date(lesson.date);
      const jsDay = date.getDay(); // 0 = Zondag, 1 = Maandag, etc.
      dayOfWeek = jsDay === 0 ? 7 : jsDay; // Converteer naar 1-7 systeem (Maandag=1, Zondag=7)
    } else if (lesson.day !== undefined && lesson.day !== null) {
      dayOfWeek = parseInt(lesson.day);
    }
    
    // Zorg ervoor dat dayOfWeek altijd een geldige waarde heeft (1-7)
    if (isNaN(dayOfWeek) || dayOfWeek < 1 || dayOfWeek > 7) {
      dayOfWeek = 1; // Default to Monday (1)
    }
    
    const result = {
      id: lesson.id || this.generateUUID(),
      title: lesson.name || lesson.title, // Ondersteun beide veldnamen
      trainer: lesson.trainer,
      time: lesson.time,
      spots: parseInt(lesson.spots) || 15,
      day_of_week: dayOfWeek, // Gebruik de berekende dag van de week
      specific_date: lesson.date || lesson.specific_date || null, // Gebruik de specifieke datum
      description: lesson.description || '',
    };
    
    console.log(`[DATE-BASED LESSON] Saving lesson for date: ${lesson.date}, day: ${dayOfWeek}`);
    console.log('Formatting lesson for database:', lesson, 'Day:', dayOfWeek, 'Date:', lesson.date);
    console.log('Formatted for database:', result);
    
    return result;
  }

  // Converteer database lesson format naar frontend format
  formatLessonForFrontend(lesson) {
    console.log('Formatting lesson for frontend:', lesson);
    console.log('[FORMAT LESSON] Received lesson from database:', lesson);
    
    // Zorg ervoor dat we de juiste veldnamen gebruiken
    const name = lesson.name || lesson.title;
    const specificDate = lesson.specific_date || lesson.date;
    
    // Voor lessen met een specifieke datum, gebruik de opgeslagen day_of_week
    // Bereken NIET de dag uit de datum, want dat overschrijft de originele dag
    let dayValue = 1; // Default to Monday (1)
    
    if (lesson.day_of_week !== undefined && lesson.day_of_week !== null) {
      dayValue = parseInt(lesson.day_of_week);
    } else if (lesson.day !== undefined && lesson.day !== null) {
      dayValue = parseInt(lesson.day);
    } else if (specificDate) {
      // Alleen als er geen day_of_week is opgeslagen, bereken dan uit de datum
      const date = new Date(specificDate);
      const jsDay = date.getDay(); // 0 = Zondag, 1 = Maandag, etc.
      dayValue = jsDay === 0 ? 7 : jsDay; // Converteer naar 1-7 systeem (Maandag=1, Zondag=7)
    }
    
    // Zorg ervoor dat dayValue altijd een geldige waarde heeft (1-7)
    if (isNaN(dayValue) || dayValue < 1 || dayValue > 7) {
      dayValue = 1; // Default to Monday (1)
    }
    
    const result = {
      id: lesson.id,
      name: name,
      title: name, // Voor compatibiliteit met oudere code
      time: lesson.time,
      trainer: lesson.trainer,
      spots: parseInt(lesson.spots) || 15,
      day: dayValue, // Gebruik de opgeslagen dag van de week
      date: specificDate,
      specific_date: specificDate, // Voor compatibiliteit met oudere code
      description: lesson.description || '',
      location: lesson.location || 'Rebels Sports',
      price: lesson.price || 0,
      image: lesson.image || 'Een generieke fitness les'
    };
    
    console.log('🔄 ApiService: Formatting lesson for frontend:', {
      original: lesson,
      formatted: result
    });
    console.log('Formatted for frontend:', result);
    
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