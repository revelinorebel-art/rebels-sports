// API Service voor Rebels Sports
// Vervangt localStorage calls met database API calls

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost/api-implementation';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE;
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

      // Wrap successful responses in consistent format
      return {
        success: true,
        data: data,
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
    return this.makeRequest('lessons.php');
  }

  async createLesson(lessonData) {
    return this.makeRequest('lessons.php', {
      method: 'POST',
      body: JSON.stringify(lessonData)
    });
  }

  async updateLesson(lessonId, lessonData) {
    return this.makeRequest(`lessons.php?id=${lessonId}`, {
      method: 'PUT',
      body: JSON.stringify(lessonData)
    });
  }

  async deleteLesson(lessonId) {
    return this.makeRequest(`lessons.php?id=${lessonId}`, {
      method: 'DELETE'
    });
  }

  // ===== RESERVERINGEN API =====
  
  async getReservations(lessonId = null, date = null) {
    let endpoint = 'reservations.php';
    const params = new URLSearchParams();
    
    if (lessonId) params.append('lesson_id', lessonId);
    if (date) params.append('date', date);
    
    if (params.toString()) {
      endpoint += '?' + params.toString();
    }
    
    return this.makeRequest(endpoint);
  }

  async createReservation(reservationData) {
    return this.makeRequest('reservations.php', {
      method: 'POST',
      body: JSON.stringify(reservationData)
    });
  }

  async deleteReservation(reservationId) {
    return this.makeRequest(`reservations.php?id=${reservationId}`, {
      method: 'DELETE'
    });
  }

  // ===== SERVICES API =====
  
  async getServices() {
    return this.makeRequest('services.php');
  }

  // ===== ADMIN API =====
  
  async adminLogin(credentials) {
    return this.makeRequest('admin/login.php', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async adminLogout() {
    return this.makeRequest('admin/logout.php', {
      method: 'POST'
    });
  }

  async getDashboardData() {
    return this.makeRequest('admin/dashboard.php');
  }

  // ===== HELPER METHODS =====
  
  // Converteer localStorage lesson format naar database format
  formatLessonForDatabase(lesson) {
    return {
      id: lesson.id,
      title: lesson.title,
      trainer: lesson.trainer,
      time: lesson.time,
      spots: lesson.spots,
      day_of_week: lesson.day,
      description: lesson.description || '',
      location: lesson.location || 'Rebels Sports',
      price: lesson.price || 0
    };
  }

  // Converteer database lesson format naar frontend format
  formatLessonForFrontend(lesson) {
    return {
      id: lesson.id,
      title: lesson.title,
      trainer: lesson.trainer,
      time: lesson.time,
      spots: lesson.spots,
      day: lesson.day_of_week,
      description: lesson.description,
      location: lesson.location,
      price: lesson.price
    };
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
  getDashboardData,
  migrateLessonsFromLocalStorage,
  migrateReservationsFromLocalStorage
} = apiService;