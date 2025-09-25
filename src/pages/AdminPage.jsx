import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, LogOut, Calendar, Plus, Edit, Trash2, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import apiService from '@/services/apiService';

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });
  const [classes, setClasses] = useState([]);
  const [classesLoaded, setClassesLoaded] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [activeTab, setActiveTab] = useState('classes');
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    time: '',
    trainer: '',
    spots: 15,
    date: new Date().toISOString().split('T')[0],
    description: ''
  });
  const { toast } = useToast();

  // Functie om beschikbare plekken te berekenen
  const getAvailableSpots = (classId, totalSpots) => {
    // Zorg ervoor dat registrations een array is
    if (!Array.isArray(registrations)) {
      return totalSpots;
    }
    
    const classRegistrations = registrations.filter(reg => 
      (reg.lesson_id || reg.classId) === classId
    );
    const reservedSpots = classRegistrations.length;
    return Math.max(0, totalSpots - reservedSpots);
  };

  // Functie om les informatie op te halen voor een reservering
  const getClassInfoForRegistration = (registration) => {
    // Zoek op basis van lesson_id (database format) of classId (legacy format)
    const lessonId = registration.lesson_id || registration.classId;
    const classInfo = classes.find(cls => cls.id == lessonId);
    return classInfo || {};
  };

  // Functie om een inschrijving te verwijderen
  const handleDeleteRegistration = async (registrationId) => {
    if (!confirm('Weet je zeker dat je deze inschrijving wilt verwijderen?')) {
      return;
    }

    try {
      const response = await apiService.deleteReservation(registrationId);
      
      if (response.success) {
        // Update lokale state
        setRegistrations(prev => prev.filter(reg => reg.id !== registrationId));
        
        // Dispatch event to notify other components about reservation updates
        window.dispatchEvent(new CustomEvent('reservationsUpdated'));
        console.log('🔄 AdminPage: Dispatched reservationsUpdated event after deleting individual reservation');
        
        toast({
          title: "Inschrijving verwijderd",
          description: "De inschrijving is succesvol verwijderd en de plek is weer beschikbaar.",
        });
      } else {
        throw new Error(response.error || 'Verwijderen mislukt');
      }
    } catch (error) {
      console.error('Error deleting registration:', error);
      toast({
        title: "Fout bij verwijderen",
        description: "Er is een fout opgetreden bij het verwijderen van de inschrijving.",
        variant: "destructive"
      });
    }
  };

  // Controleer bij het laden van de pagina of de gebruiker is ingelogd
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiService.checkAdminAuth();
        setIsAuthenticated(response.success);
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
      } finally {
        // Zorg ervoor dat loading altijd wordt gestopt
        setIsLoading(false);
      }
    };
    
    // Voeg een timeout toe voor het geval de API call te lang duurt
    const timeoutId = setTimeout(() => {
      console.warn("Auth check timeout - setting loading to false");
      setIsLoading(false);
      setIsAuthenticated(false);
    }, 5000); // 5 seconden timeout
    
    checkAuth().finally(() => {
      clearTimeout(timeoutId);
    });
    
    return () => clearTimeout(timeoutId);
  }, []);
  
  // Laad lessen uit database
  useEffect(() => {
    const loadClasses = async () => {
      try {
        const response = await apiService.getLessons();
        if (response.success) {
          const formattedClasses = response.data.map(lesson => 
            apiService.formatLessonForFrontend(lesson)
          );
          setClasses(formattedClasses);
        } else {
          console.error("Failed to load classes:", response.error);
          toast({
            title: "Database fout",
            description: "Kan lessen niet laden uit database. Controleer de verbinding.",
            variant: "destructive"
          });
          setClasses([]);
        }
        setClassesLoaded(true);
      } catch (error) {
        console.error("Failed to load classes from database:", error);
        toast({
          title: "Database fout", 
          description: "Kan geen verbinding maken met database.",
          variant: "destructive"
        });
        setClasses([]);
        setClassesLoaded(true);
      }
    };

    if (isAuthenticated) {
      loadClasses();
    }
  }, [isAuthenticated]);

  // Laad inschrijvingen uit database
  useEffect(() => {
    const loadRegistrations = async () => {
      try {
        const response = await apiService.getReservations();
        if (response.success) {
          setRegistrations(response.data);
        } else {
          console.error("Failed to load registrations:", response.error);
          toast({
            title: "Database fout",
            description: "Kan reserveringen niet laden uit database.",
            variant: "destructive"
          });
          setRegistrations([]);
        }
      } catch (error) {
        console.error("Failed to load registrations from database:", error);
        toast({
          title: "Database fout",
          description: "Kan geen verbinding maken met database voor reserveringen.",
          variant: "destructive"
        });
        setRegistrations([]);
      }
    };

    if (isAuthenticated) {
      loadRegistrations();
    }
  }, [isAuthenticated]);



  // Real-time synchronisatie met event listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleLessonsUpdated = async () => {
      console.log('Lessen bijgewerkt - synchroniseren admin interface');
      try {
        const response = await apiService.getLessons();
        if (response.success) {
          const formattedClasses = response.data.map(lesson => 
            apiService.formatLessonForFrontend(lesson)
          );
          setClasses(formattedClasses);
        }
      } catch (error) {
        console.error('Fout bij synchroniseren van lessen:', error);
      }
    };

    const handleReservationsUpdated = async () => {
      console.log('Reserveringen bijgewerkt - synchroniseren admin interface');
      try {
        const response = await apiService.getReservations();
        if (response.success) {
          setRegistrations(response.data);
        }
      } catch (error) {
        console.error('Fout bij synchroniseren van reserveringen:', error);
      }
    };

    // Luister naar custom events van de mock data store
    window.addEventListener('lessonsUpdated', handleLessonsUpdated);
    window.addEventListener('reservationsUpdated', handleReservationsUpdated);

    return () => {
      window.removeEventListener('lessonsUpdated', handleLessonsUpdated);
      window.removeEventListener('reservationsUpdated', handleReservationsUpdated);
    };
  }, [isAuthenticated]);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await apiService.adminLogin(
        loginData.username,
        loginData.password
      );
      
      if (response.success) {
        setIsAuthenticated(true);
        toast({
          title: "Ingelogd",
          description: "Welkom in het admin panel!",
          variant: "default"
        });
      } else {
        toast({
          title: "Login mislukt",
          description: response.error || "Ongeldige inloggegevens",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login fout",
        description: "Kan geen verbinding maken met server.",
        variant: "destructive"
      });
    }
  };

  const handleLogout = async () => {
    try {
      await apiService.adminLogout();
      setIsAuthenticated(false);
      toast({
        title: "Uitgelogd",
        description: "Je bent succesvol uitgelogd.",
        variant: "default"
      });
    } catch (error) {
      console.error("Logout error:", error);
      // Zelfs als logout faalt, log lokaal uit
      setIsAuthenticated(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'spots' ? parseInt(value) : value
    }));
  };



  const handleSaveClass = async () => {
    if (!formData.title || !formData.time || !formData.trainer || !formData.date) {
      toast({
        title: "Validatie fout",
        description: "Vul alle verplichte velden in.",
        variant: "destructive"
      });
      return;
    }

    try {
      const lessonData = apiService.formatLessonForDatabase({
        ...formData,
        id: editingClass ? editingClass.id : uuidv4()
      });

      console.log('Formatted data for API:', lessonData);

      let response;
      if (editingClass) {
        response = await apiService.updateLesson(editingClass.id, lessonData);
      } else {
        response = await apiService.createLesson(lessonData);
      }

      console.log('API response:', response);

      if (response.success) {
        // Herlaad lessen uit database om de UI bij te werken
        try {
          const lessonsResponse = await apiService.getLessons();
          if (lessonsResponse.success) {
            const formattedClasses = lessonsResponse.data.map(lesson => 
              apiService.formatLessonForFrontend(lesson)
            );
            setClasses(formattedClasses);
            
            // Verstuur event om andere componenten te informeren over de update
            console.log('🔄 AdminPage: Dispatching lessonsUpdated event na les opslaan');
            window.dispatchEvent(new CustomEvent('lessonsUpdated', {
              detail: { action: 'saved', lesson: lessonData }
            }));
            
            // Ook localStorage event voor cross-page synchronisatie
            localStorage.setItem('lessonsLastUpdated', Date.now().toString());
            localStorage.setItem('classes', JSON.stringify(lessonsResponse.data));
            
            // Trigger localStorage event voor andere tabs
            window.dispatchEvent(new StorageEvent('storage', {
              key: 'classes',
              newValue: JSON.stringify(lessonsResponse.data)
            }));
            
            // Extra synchronisatie trigger voor cross-page updates
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('lessonsUpdated'));
              console.log('🔄 AdminPage: Extra lessonsUpdated event verzonden voor synchronisatie');
            }, 100);
          }
        } catch (error) {
          console.error("Error reloading classes:", error);
        }

        setActiveTab('classes'); // Return to classes tab after saving
        setEditingClass(null);
        setFormData({
          title: '',
          time: '',
          trainer: '',
          spots: 15,
          date: new Date().toISOString().split('T')[0],
          description: ''
        });
        
        toast({
          title: editingClass ? "Les bijgewerkt" : "Les toegevoegd",
          description: editingClass ? "De les is succesvol bijgewerkt." : "De nieuwe les is toegevoegd.",
          variant: "default"
        });
      } else {
        toast({
          title: "Database fout",
          description: response.error || "Kan les niet opslaan.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error saving class:", error);
      toast({
        title: "Database fout",
        description: "Kan geen verbinding maken met database.",
        variant: "destructive"
      });
    }
  };

  const handleEditClass = (cls) => {
    setEditingClass(cls);
    setFormData({
      title: cls.title,
      time: cls.time,
      trainer: cls.trainer,
      spots: cls.spots,
      date: cls.date,
      description: cls.description || ''
    });
    setActiveTab('add'); // Switch to the add tab for editing
  };

  const handleDeleteAllReservationsForClass = async (classId) => {
    try {
      // Find all reservations for this class
      const classReservations = registrations.filter(reg => 
        (reg.lesson_id && reg.lesson_id == classId) || 
        (reg.classId && reg.classId == classId)
      );
      
      if (classReservations.length === 0) {
        return { success: true };
      }
      
      // Delete all reservations for this class
      const deletePromises = classReservations.map(reservation => 
        apiService.deleteReservation(reservation.id)
      );
      
      const results = await Promise.all(deletePromises);
      const allSuccessful = results.every(result => result.success);
      
      if (allSuccessful) {
        // Update local state
        setRegistrations(prev => prev.filter(reg => 
          !((reg.lesson_id && reg.lesson_id == classId) || 
            (reg.classId && reg.classId == classId))
        ));
        return { success: true, deletedCount: classReservations.length };
      } else {
        return { success: false, error: "Niet alle reserveringen konden worden verwijderd" };
      }
    } catch (error) {
      console.error('Error deleting reservations for class:', error);
      return { success: false, error: error.message };
    }
  };

  const handleDeleteClass = async (classId) => {
    try {
      // First, reload reservations to get the most up-to-date data
      const reservationsResponse = await apiService.getReservations();
      let currentReservations = [];
      
      if (reservationsResponse.success) {
        currentReservations = reservationsResponse.data || [];
        setRegistrations(currentReservations);
      } else {
        console.error("Failed to reload reservations:", reservationsResponse.error);
        currentReservations = registrations; // fallback to current state
      }
      
      // Check if there are reservations for this class
      const classReservations = currentReservations.filter(reg => 
        (reg.lesson_id && reg.lesson_id == classId) || 
        (reg.classId && reg.classId == classId)
      );
      
      let confirmMessage = 'Weet je zeker dat je deze les wilt verwijderen?';
      if (classReservations.length > 0) {
        confirmMessage = `Deze les heeft nog ${classReservations.length} reservering(en). Wil je de les én alle reserveringen verwijderen?`;
      }
      
      if (!confirm(confirmMessage)) {
        return;
      }
    } catch (error) {
      console.error("Error reloading reservations:", error);
      if (!confirm('Kan reserveringen niet controleren. Wil je de les toch proberen te verwijderen?')) {
        return;
      }
    }

    try {
      // Get the current reservations for this class
      const reservationsResponse = await apiService.getReservations();
      let currentReservations = [];
      
      if (reservationsResponse.success) {
        currentReservations = reservationsResponse.data || [];
      }
      
      const classReservations = currentReservations.filter(reg => 
        (reg.lesson_id && reg.lesson_id == classId) || 
        (reg.classId && reg.classId == classId)
      );
      
      // First, delete all reservations for this class if any exist
      if (classReservations.length > 0) {
        console.log(`🗑️ Deleting ${classReservations.length} reservations for lesson ${classId}`);
        
        // Delete each reservation individually
        for (const reservation of classReservations) {
          try {
            const deleteResult = await apiService.deleteReservation(reservation.id);
            if (!deleteResult.success) {
              console.error(`Failed to delete reservation ${reservation.id}:`, deleteResult.error);
            } else {
              console.log(`✅ Deleted reservation ${reservation.id}`);
            }
          } catch (error) {
            console.error(`Error deleting reservation ${reservation.id}:`, error);
          }
        }
        
        // Update local state
        setRegistrations(prev => prev.filter(reg => 
          !((reg.lesson_id && reg.lesson_id == classId) || 
            (reg.classId && reg.classId == classId))
        ));
        
        // Dispatch event to notify other components about reservation updates
        window.dispatchEvent(new CustomEvent('reservationsUpdated'));
        console.log('🔄 AdminPage: Dispatched reservationsUpdated event after deleting reservations');
        
        toast({
          title: "Reserveringen verwijderd",
          description: `${classReservations.length} reservering(en) zijn verwijderd.`,
          variant: "default"
        });
      }
      
      // Now delete the lesson
      const response = await apiService.deleteLesson(classId);
      
      if (response.success) {
        // Update lokale state - verwijder de les uit de lijst
        setClasses(prev => prev.filter(cls => cls.id !== classId));
        
        // Verstuur event om andere componenten te informeren over de verwijdering
        console.log('🗑️ AdminPage: Dispatching lessonsUpdated event na les verwijderen');
        window.dispatchEvent(new CustomEvent('lessonsUpdated'));
        
        // Ook localStorage event voor cross-page synchronisatie
        localStorage.setItem('lessonsLastUpdated', Date.now().toString());
        
        // Extra synchronisatie trigger voor cross-page updates
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('lessonsUpdated'));
          console.log('🗑️ AdminPage: Extra lessonsUpdated event verzonden na verwijderen');
        }, 100);
        
        toast({
          title: "Les verwijderd",
          description: "De les is succesvol verwijderd.",
          variant: "default"
        });
      } else {
        // Check if the error is about existing reservations
        const errorMessage = response.error || "Kan les niet verwijderen.";
        const isReservationError = errorMessage.includes("reserveringen") || errorMessage.includes("reservations");
        
        toast({
          title: isReservationError ? "Les heeft nog reserveringen" : "Database fout",
          description: isReservationError 
            ? "Deze les kan niet worden verwijderd omdat er nog actieve reserveringen zijn. Verwijder eerst alle reserveringen voor deze les."
            : errorMessage,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error deleting class:", error);
      
      // Check if the error message contains reservation info
      const errorMessage = error.message || error.toString();
      const isReservationError = errorMessage.includes("reserveringen") || errorMessage.includes("reservations");
      
      toast({
        title: isReservationError ? "Les heeft nog reserveringen" : "Database fout",
        description: isReservationError 
          ? "Deze les kan niet worden verwijderd omdat er nog actieve reserveringen zijn. Verwijder eerst alle reserveringen voor deze les."
          : "Kan geen verbinding maken met database.",
        variant: "destructive"
      });
    }
  };
  
  if (!isAuthenticated && !isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-zinc-900 p-8 rounded-xl shadow-2xl max-w-md w-full"
        >
          <div className="flex items-center justify-center mb-6">
            <ShieldCheck className="h-12 w-12 text-red-600 mr-4" />
            <h1 className="text-3xl font-bold text-white">Admin Login</h1>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white">Gebruikersnaam</Label>
              <Input
                id="username"
                type="text"
                value={loginData.username}
                onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
                className="bg-zinc-800 border-zinc-700 text-white"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Wachtwoord</Label>
              <Input
                id="password"
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                className="bg-zinc-800 border-zinc-700 text-white"
                required
              />
            </div>
            
            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
              Inloggen
            </Button>
          </form>
        </motion.div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Laden...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button variant="ghost" onClick={handleLogout} className="flex items-center">
            <LogOut className="mr-2 h-4 w-4" /> Uitloggen
          </Button>
        </div>
        
        <div className="flex mb-6 border-b border-zinc-800">
          <button
            className={`px-4 py-2 ${activeTab === 'classes' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-400'}`}
            onClick={() => setActiveTab('classes')}
          >
            Lessen Beheren
          </button>
          <button
              className={`px-4 py-2 ${activeTab === 'registrations' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-400'}`}
              onClick={() => setActiveTab('registrations')}
            >
              Inschrijvingen
            </button>
          <button
            className={`px-4 py-2 ${activeTab === 'add' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-400'}`}
            onClick={() => {
              setActiveTab('add');
              setEditingClass(null);
              setFormData({
                title: '',
                time: '',
                trainer: '',
                spots: 15,
                date: new Date().toISOString().split('T')[0],
                description: ''
              });
            }}
          >
            Les Toevoegen/Bewerken
          </button>
        </div>
        
        {activeTab === 'classes' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-red-600" />
                <h2 className="text-xl font-semibold">Lessen Beheren</h2>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => {
                  setActiveTab('add');
                  setEditingClass(null);
                  setFormData({
                    title: '',
                    time: '',
                    trainer: '',
                    spots: 15,
                    date: new Date().toISOString().split('T')[0],
                    description: ''
                  });
                }} className="bg-red-600 hover:bg-red-700">
                  <Plus className="mr-2 h-4 w-4" /> Nieuwe Les
                </Button>
              </div>
            </div>


            
            {classes.length === 0 ? (
              <div className="bg-zinc-900 rounded-lg p-8 text-center">
                <p className="text-gray-400">Nog geen lessen toegevoegd.</p>
                <Button onClick={() => {
                  setActiveTab('add');
                  setEditingClass(null);
                  setFormData({
                    title: '',
                    time: '',
                    trainer: '',
                    spots: 15,
                    date: new Date().toISOString().split('T')[0],
                    description: ''
                  });
                }} className="mt-4 bg-red-600 hover:bg-red-700">
                  <Plus className="mr-2 h-4 w-4" /> Eerste Les Toevoegen
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Toon alle lessen in een lijst */}
                <div className="bg-zinc-900 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 text-red-600">
                    Alle Lessen
                  </h3>
                  <div className="grid gap-4">
                    {classes
                      .sort((a, b) => {
                        // Sorteer op datum en dan op tijd
                        if (a.date !== b.date) {
                          return new Date(a.date) - new Date(b.date);
                        }
                        const timeA = a.time.split(' - ')[0];
                        const timeB = b.time.split(' - ')[0];
                        return timeA.localeCompare(timeB);
                      })
                      .map(cls => (
                        <div key={cls.id} className="bg-zinc-800 rounded-lg p-4 flex justify-between items-center">
                          <div>
                            <h4 className="text-lg font-semibold">{cls.title}</h4>
                            <div className="flex mt-2 space-x-6 text-gray-400 text-sm">
                              <div className="flex items-center">
                                <Clock className="mr-1 h-3 w-3" />
                                {cls.time}
                              </div>
                              <div className="flex items-center">
                                <Users className="mr-1 h-3 w-3" />
                                {cls.trainer}
                              </div>
                              <div className="flex items-center">
                                <Users className="mr-1 h-3 w-3" />
                                {(() => {
                                  const availableSpots = getAvailableSpots(cls.id, cls.spots);
                                  return (
                                    <span className={availableSpots === 0 ? 'text-red-400' : availableSpots <= 3 ? 'text-yellow-400' : 'text-green-400'}>
                                      {availableSpots}/{cls.spots} beschikbaar
                                    </span>
                                  );
                                })()}
                              </div>
                              {cls.date && (
                                <div className="flex items-center">
                                  <Calendar className="mr-1 h-3 w-3" />
                                  {(() => {
                                    const dateParts = cls.date.split('-');
                                    const year = parseInt(dateParts[0], 10);
                                    const month = parseInt(dateParts[1], 10) - 1;
                                    const day = parseInt(dateParts[2], 10);
                                    const safeDate = new Date(year, month, day);
                                    return safeDate.toLocaleDateString('nl-NL');
                                  })()}
                                </div>
                              )}
                            </div>
                            {cls.description && (
                              <p className="text-gray-500 text-sm mt-1">{cls.description}</p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditClass(cls)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-500" onClick={() => handleDeleteClass(cls.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {activeTab === 'registrations' && (
          <div>
            <div className="flex items-center mb-6">
              <Users className="mr-2 h-5 w-5 text-red-600" />
              <h2 className="text-xl font-semibold">Inschrijvingen Overzicht</h2>
            </div>
            
            {registrations.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">Geen inschrijvingen</h3>
                <p className="text-gray-400">Er zijn nog geen inschrijvingen voor lessen.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-gray-400 mb-4">
                  Totaal aantal inschrijvingen: {registrations.length}
                </div>
                
                {(Array.isArray(registrations) ? registrations : [])
                  .sort((a, b) => {
                    try {
                      return new Date(b.registeredAt || b.created_at || Date.now()) - new Date(a.registeredAt || a.created_at || Date.now());
                    } catch (error) {
                      console.error('Error sorting registrations:', error);
                      return 0;
                    }
                  })
                  .map((registration) => {
                    try {
                      const classInfo = getClassInfoForRegistration(registration) || {};
                      return (
                        <motion.div
                          key={registration.id || Math.random()}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-zinc-800 rounded-lg p-6 border border-zinc-700"
                        >
                        <div className="flex flex-col md:flex-row md:items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-3">
                              <h3 className="text-lg font-semibold text-white">
                                {registration.name || registration.participant_name}
                              </h3>
                              <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full">
                                Ingeschreven
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-400">Email:</span>
                                <span className="ml-2 text-white">{registration.email || registration.participant_email}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Les:</span>
                                <span className="ml-2 text-white">{classInfo.name || classInfo.title || registration.className || 'Onbekende les'}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Datum:</span>
                                <span className="ml-2 text-white">{registration.classDate || registration.lesson_date}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Tijd:</span>
                                <span className="ml-2 text-white">{classInfo.time || registration.classTime || 'Tijd niet beschikbaar'}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Trainer:</span>
                                <span className="ml-2 text-white">{classInfo.trainer || 'Trainer niet beschikbaar'}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Telefoon:</span>
                                <span className="ml-2 text-white">{registration.phone || registration.participant_phone || 'Niet opgegeven'}</span>
                              </div>
                              <div className="md:col-span-2 lg:col-span-3">
                                <span className="text-gray-400">Beschrijving:</span>
                                <span className="ml-2 text-white">{classInfo.description || 'Geen beschrijving beschikbaar'}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Ingeschreven op:</span>
                                <span className="ml-2 text-white">
                                  {new Date(registration.registeredAt || registration.created_at || registration.timestamp).toLocaleString('nl-NL')}
                                </span>
                              </div>
                              {registration.notes && (
                                <div className="md:col-span-2 lg:col-span-3">
                                  <span className="text-gray-400">Opmerkingen:</span>
                                  <span className="ml-2 text-white">{registration.notes}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="mt-4 md:mt-0 md:ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                              onClick={() => handleDeleteRegistration(registration.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Verwijderen
                            </Button>
                          </div>
                        </div>
                        </motion.div>
                      );
                    } catch (error) {
                      console.error('Error rendering registration:', registration, error);
                      return (
                        <div key={registration.id || Math.random()} className="bg-red-900 text-white p-4 rounded">
                          Error rendering registration: {error.message}
                        </div>
                      );
                    }
                  })}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'add' && (
          <div>
            <div className="flex items-center mb-6">
              <Calendar className="mr-2 h-5 w-5 text-red-600" />
              <h2 className="text-xl font-semibold">
                {editingClass ? 'Les Bewerken' : 'Nieuwe Les Toevoegen'}
              </h2>
            </div>
            
            <div className="bg-zinc-900 rounded-lg p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Naam van de les</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="bg-zinc-800 border-zinc-700"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="time">Tijdstip (bijv. 09:00 - 10:00)</Label>
                  <Input
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="bg-zinc-800 border-zinc-700"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="trainer">Trainer</Label>
                  <Input
                    id="trainer"
                    name="trainer"
                    value={formData.trainer}
                    onChange={handleInputChange}
                    className="bg-zinc-800 border-zinc-700"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="spots">Aantal plekken</Label>
                  <Input
                    id="spots"
                    name="spots"
                    type="number"
                    min="1"
                    value={formData.spots}
                    onChange={handleInputChange}
                    className="bg-zinc-800 border-zinc-700"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-lg font-semibold text-red-400">Datum *</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="bg-zinc-800 border-zinc-700 text-lg py-3 border-2 border-red-500/30 focus:border-red-500"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Beschrijving</Label>
                  <Input
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="bg-zinc-800 border-zinc-700"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setActiveTab('classes');
                    setEditingClass(null);
                    setFormData({
                      title: '',
                      time: '',
                      trainer: '',
                      spots: 15,
                      date: new Date().toISOString().split('T')[0],
                      description: ''
                    });
                  }}
                >
                  Annuleren
                </Button>
                <Button onClick={handleSaveClass} className="bg-red-600 hover:bg-red-700">
                  {editingClass ? 'Les Bijwerken' : 'Les Toevoegen'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;