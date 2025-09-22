import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, LogOut, Calendar, Plus, Edit, Trash2, Clock, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import apiService from '@/services/apiService';

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [classes, setClasses] = useState([]);
  const [classesLoaded, setClassesLoaded] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [activeTab, setActiveTab] = useState('classes');
  const [selectedDay, setSelectedDay] = useState(1);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    time: '',
    trainer: '',
    spots: 15,
    day: 1, // Wordt automatisch berekend op basis van datum
    date: new Date().toISOString().split('T')[0], // Vandaag als standaard
    description: 'Een nieuwe fitness les'
  });
  const { toast } = useToast();

  // Helper functies voor weeknavigatie
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Maandag als start van de week
    return new Date(d.setDate(diff));
  };

  const getWeekEnd = (date) => {
    const weekStart = getWeekStart(date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return weekEnd;
  };

  const formatWeekRange = (date) => {
    const start = getWeekStart(date);
    const end = getWeekEnd(date);
    return `${start.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  };

  const isDateInCurrentWeek = (dateString) => {
    if (!dateString) return false;
    
    // Parse the date string properly to avoid timezone issues
    const dateParts = dateString.split('-');
    const date = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
    
    const weekStart = getWeekStart(currentWeek);
    const weekEnd = getWeekEnd(currentWeek);
    
    // Set time to start of day for proper comparison
    weekStart.setHours(0, 0, 0, 0);
    weekEnd.setHours(23, 59, 59, 999);
    date.setHours(0, 0, 0, 0);
    
    return date >= weekStart && date <= weekEnd;
  };

  const navigateWeek = (direction) => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction * 7));
    setCurrentWeek(newWeek);
  };

  // Functie om beschikbare plekken te berekenen
  const getAvailableSpots = (classId, totalSpots) => {
    const classRegistrations = registrations.filter(reg => reg.classId === classId);
    const reservedSpots = classRegistrations.length;
    return Math.max(0, totalSpots - reservedSpots);
  };

  // Controleer bij het laden van de pagina of de gebruiker is ingelogd
  useEffect(() => {
    const authStatus = localStorage.getItem('adminAuthenticated');
    setIsAuthenticated(authStatus === 'true');
    setIsLoading(false);
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
          // Fallback naar localStorage
          const storedClasses = localStorage.getItem('rebelsClasses');
          if (storedClasses) {
            setClasses(JSON.parse(storedClasses));
            toast({
              title: "Offline modus",
              description: "Lessen geladen uit lokale opslag. Database verbinding mislukt.",
              variant: "destructive"
            });
          }
        }
        setClassesLoaded(true);
      } catch (error) {
        console.error("Failed to load classes from database:", error);
        // Fallback naar localStorage
        try {
          const storedClasses = localStorage.getItem('rebelsClasses');
          if (storedClasses) {
            setClasses(JSON.parse(storedClasses));
            toast({
              title: "Offline modus",
              description: "Lessen geladen uit lokale opslag. Database verbinding mislukt.",
              variant: "destructive"
            });
          }
        } catch (localError) {
          console.error("Failed to parse classes from localStorage", localError);
          setClasses([]);
        }
        setClassesLoaded(true);
      }
    };

    loadClasses();
  }, []);
  
  // Update localStorage wanneer lessen veranderen (alleen na initiële load)
  useEffect(() => {
    if (classesLoaded) {
      localStorage.setItem('rebelsClasses', JSON.stringify(classes));
    }
  }, [classes, classesLoaded]);

  // Laad inschrijvingen uit database
  useEffect(() => {
    const loadRegistrations = async () => {
      try {
        const response = await apiService.getReservations();
        if (response.success) {
          // Converteer database reserveringen naar frontend formaat
          const formattedRegistrations = response.data.map(reservation => ({
            id: reservation.id,
            name: reservation.participant_name,
            email: reservation.participant_email,
            phone: reservation.participant_phone || '',
            classId: `${reservation.lesson_id}-${reservation.lesson_date}`,
            className: reservation.lesson_title,
            classDate: reservation.lesson_date,
            classTime: reservation.lesson_time,
            trainer: reservation.lesson_trainer,
            registeredAt: reservation.created_at,
            notes: reservation.notes || ''
          }));
          setRegistrations(formattedRegistrations);
        } else {
          console.error("Failed to load registrations:", response.error);
          // Fallback naar localStorage
          const storedRegistrations = localStorage.getItem('rebelsRegistrations');
          if (storedRegistrations) {
            setRegistrations(JSON.parse(storedRegistrations));
            toast({
              title: "Offline modus",
              description: "Inschrijvingen geladen uit lokale opslag. Database verbinding mislukt.",
              variant: "destructive"
            });
          }
        }
      } catch (error) {
        console.error("Failed to load registrations from database:", error);
        // Fallback naar localStorage
        try {
          const storedRegistrations = localStorage.getItem('rebelsRegistrations');
          if (storedRegistrations) {
            setRegistrations(JSON.parse(storedRegistrations));
            toast({
              title: "Offline modus",
              description: "Inschrijvingen geladen uit lokale opslag. Database verbinding mislukt.",
              variant: "destructive"
            });
          }
        } catch (localError) {
          console.error("Failed to parse registrations from localStorage", localError);
          setRegistrations([]);
        }
      }
    };

    loadRegistrations();
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    
    const adminUsername = import.meta.env.VITE_ADMIN_USERNAME || 'admin';
      const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'rebels123';
      
      if (username === adminUsername && password === adminPassword) {
      localStorage.setItem('adminAuthenticated', 'true');
      setIsAuthenticated(true);
      toast({
        title: "Ingelogd!",
        description: "Je bent succesvol ingelogd als beheerder.",
      });
    } else {
      toast({
        title: "Fout bij inloggen",
        description: "Ongeldige gebruikersnaam of wachtwoord.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    setIsAuthenticated(false);
    toast({
      title: "Uitgelogd",
      description: "Je bent succesvol uitgelogd.",
    });
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let updatedFormData = {
      ...formData,
      [name]: name === 'spots' ? parseInt(value) : value
    };
    
    // Automatisch dag van de week berekenen op basis van datum
    if (name === 'date' && value) {
      const selectedDate = new Date(value);
      const dayOfWeek = selectedDate.getDay(); // 0 = zondag, 1 = maandag, etc.
      updatedFormData.day = dayOfWeek === 0 ? 7 : dayOfWeek; // Converteer naar 1-7 (maandag-zondag)
    }
    
    setFormData(updatedFormData);
  };
  
  const handleAddClass = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.date || !formData.time || !formData.spots) {
       toast({
         title: "Fout",
         description: "Vul alle verplichte velden in (titel, datum, tijd en aantal plekken)",
         variant: "destructive"
       });
       return;
     }
    
    const lessonData = apiService.formatLessonForDatabase(formData);
    
    try {
      let response;
      if (formData.id) {
        // Update bestaande les
        response = await apiService.updateLesson(formData.id, lessonData);
        if (response.success) {
          const updatedClasses = classes.map(cls => cls.id === formData.id ? formData : cls);
          setClasses(updatedClasses);
          toast({
            title: "Les bijgewerkt",
            description: `De les "${formData.title}" is succesvol bijgewerkt.`
          });
        } else {
          throw new Error(response.error);
        }
      } else {
        // Nieuwe les toevoegen
        response = await apiService.createLesson(lessonData);
        if (response.success) {
          const newClass = {
            ...formData,
            id: response.data.id || uuidv4()
          };
          const updatedClasses = [...classes, newClass];
          setClasses(updatedClasses);
          toast({
            title: "Les toegevoegd",
            description: `De les "${formData.title}" is succesvol toegevoegd aan het rooster.`
          });
        } else {
          throw new Error(response.error);
        }
      }
    } catch (error) {
      console.error("Failed to save lesson to database:", error);
      
      // Fallback naar localStorage
      const newClass = {
        ...formData,
        id: formData.id || uuidv4()
      };
      
      if (formData.id) {
        const updatedClasses = classes.map(cls => cls.id === formData.id ? newClass : cls);
        setClasses(updatedClasses);
        localStorage.setItem('rebelsClasses', JSON.stringify(updatedClasses));
        toast({
          title: "Les bijgewerkt (offline)",
          description: `De les "${newClass.title}" is lokaal opgeslagen. Database verbinding mislukt.`,
          variant: "destructive"
        });
      } else {
        const updatedClasses = [...classes, newClass];
        setClasses(updatedClasses);
        localStorage.setItem('rebelsClasses', JSON.stringify(updatedClasses));
        toast({
          title: "Les toegevoegd (offline)",
          description: `De les "${newClass.title}" is lokaal opgeslagen. Database verbinding mislukt.`,
          variant: "destructive"
        });
      }
    }
    
    setFormData({
      id: null,
      title: '',
      time: '',
      trainer: '',
      spots: 15,
      day: 1, // Wordt automatisch berekend
      date: new Date().toISOString().split('T')[0],
      description: 'Een nieuwe fitness les'
    });
  };
  
  const handleEditClass = (cls) => {
    setFormData(cls);
    setActiveTab('add');
  };
  
  const handleDeleteClass = async (id) => {
    try {
      const response = await apiService.deleteLesson(id);
      if (response.success) {
        setClasses(prevClasses => {
          const updatedClasses = prevClasses.filter(c => c.id !== id);
          toast({
            title: "Succes",
            description: "Les succesvol verwijderd"
          });
          return updatedClasses;
        });
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error("Failed to delete lesson from database:", error);
      
      // Fallback naar localStorage
      setClasses(prevClasses => {
        const updatedClasses = prevClasses.filter(c => c.id !== id);
        localStorage.setItem('rebelsClasses', JSON.stringify(updatedClasses));
        toast({
          title: "Les verwijderd (offline)",
          description: "Les lokaal verwijderd. Database verbinding mislukt.",
          variant: "destructive"
        });
        return updatedClasses;
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
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Wachtwoord</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
  
  const filteredClasses = classes.filter(cls => cls.day === selectedDay);
  
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
            onClick={() => setActiveTab('add')}
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
              <Button onClick={() => {
                setFormData({
                  id: null,
                  title: '',
                  time: '',
                  trainer: '',
                  spots: 15,
                  day: 1, // Wordt automatisch berekend
                  date: new Date().toISOString().split('T')[0],
                  description: 'Een nieuwe fitness les'
                });
                setActiveTab('add');
              }} className="bg-red-600 hover:bg-red-700">
                <Plus className="mr-2 h-4 w-4" /> Nieuwe Les
              </Button>
            </div>

            {/* Week navigatie */}
            <div className="bg-zinc-900 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateWeek(-1)}
                  className="flex items-center"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Vorige Week
                </Button>
                
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white">
                    Week van {formatWeekRange(currentWeek)}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {currentWeek.toLocaleDateString('nl-NL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateWeek(1)}
                  className="flex items-center"
                >
                  Volgende Week
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
            
            {classes.length === 0 ? (
              <div className="bg-zinc-900 rounded-lg p-8 text-center">
                <p className="text-gray-400">Nog geen lessen toegevoegd.</p>
                <Button onClick={() => {
                  setFormData({
                    id: null,
                    title: '',
                    time: '',
                    trainer: '',
                    spots: 15,
                    day: 1, // Wordt automatisch berekend
                    date: new Date().toISOString().split('T')[0],
                    description: 'Een nieuwe fitness les'
                  });
                  setActiveTab('add');
                }} className="mt-4 bg-red-600 hover:bg-red-700">
                  <Plus className="mr-2 h-4 w-4" /> Eerste Les Toevoegen
                </Button>
              </div>
            ) : (
              (() => {
                const weekClasses = classes.filter(cls => !cls.date || isDateInCurrentWeek(cls.date));
                if (weekClasses.length === 0) {
                  return (
                    <div className="bg-zinc-900 rounded-lg p-8 text-center">
                      <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-400 mb-2">Geen lessen gevonden voor deze week.</p>
                      <p className="text-sm text-gray-500 mb-4">
                        Week van {formatWeekRange(currentWeek)}
                      </p>
                      <Button onClick={() => {
                        setFormData({
                          id: null,
                          title: '',
                          time: '',
                          trainer: '',
                          spots: 15,
                          day: 1,
                          date: getWeekStart(currentWeek).toISOString().split('T')[0],
                          description: 'Een nieuwe fitness les'
                        });
                        setActiveTab('add');
                      }} className="bg-red-600 hover:bg-red-700">
                        <Plus className="mr-2 h-4 w-4" /> Les Toevoegen voor Deze Week
                      </Button>
                    </div>
                  );
                }
                return (
              <div className="space-y-6">
                {[1, 2, 3, 4, 5, 6, 7].map(day => {
                  const dayClasses = classes.filter(cls => 
                    cls.day === day && (!cls.date || isDateInCurrentWeek(cls.date))
                  );
                  const dayNames = {
                    1: 'Maandag',
                    2: 'Dinsdag', 
                    3: 'Woensdag',
                    4: 'Donderdag',
                    5: 'Vrijdag',
                    6: 'Zaterdag',
                    7: 'Zondag'
                  };
                  
                  if (dayClasses.length === 0) return null;
                  
                  return (
                    <div key={day} className="bg-zinc-900 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4 text-red-600">{dayNames[day]}</h3>
                      <div className="grid gap-4">
                        {dayClasses
                          .sort((a, b) => {
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
                                      const reservedSpots = cls.spots - availableSpots;
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
                                      {new Date(cls.date).toLocaleDateString('nl-NL')}
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
                                <Button variant="destructive" size="sm" onClick={() => handleDeleteClass(cls.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  );
                })}
              </div>
                );
              })()
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
                
                {registrations
                  .sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt))
                  .map((registration) => (
                    <motion.div
                      key={registration.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-zinc-800 rounded-lg p-6 border border-zinc-700"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <h3 className="text-lg font-semibold text-white">
                              {registration.name}
                            </h3>
                            <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full">
                              Ingeschreven
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">Email:</span>
                              <span className="ml-2 text-white">{registration.email}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Les:</span>
                              <span className="ml-2 text-white">{registration.className}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Datum:</span>
                              <span className="ml-2 text-white">{registration.classDate}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Tijd:</span>
                              <span className="ml-2 text-white">{registration.classTime}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Ingeschreven op:</span>
                              <span className="ml-2 text-white">
                                {new Date(registration.registeredAt).toLocaleString('nl-NL')}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 md:mt-0 md:ml-6">
                          <Button
                            onClick={() => {
                              // Functie om inschrijving te verwijderen
                              const updatedRegistrations = registrations.filter(r => r.id !== registration.id);
                              setRegistrations(updatedRegistrations);
                              localStorage.setItem('rebelsRegistrations', JSON.stringify(updatedRegistrations));
                              
                              // Update ook de reserveringen voor backwards compatibility
                              const reservationKey = 'rebelsReservations';
                              const existingReservations = JSON.parse(localStorage.getItem(reservationKey) || '{}');
                              
                              if (existingReservations[registration.classId]) {
                                existingReservations[registration.classId].reservedSpots = Math.max(0, 
                                  existingReservations[registration.classId].reservedSpots - 1
                                );
                                
                                // Verwijder de reservering helemaal als er geen spots meer zijn
                                if (existingReservations[registration.classId].reservedSpots === 0) {
                                  delete existingReservations[registration.classId];
                                }
                              }
                              
                              localStorage.setItem(reservationKey, JSON.stringify(existingReservations));
                              
                              // Trigger storage event voor andere componenten
                              window.dispatchEvent(new StorageEvent('storage', {
                                key: reservationKey,
                                newValue: JSON.stringify(existingReservations),
                                storageArea: localStorage
                              }));
                              
                              toast({
                                title: "Inschrijving verwijderd",
                                description: `Inschrijving van ${registration.name} is verwijderd. De plek is weer beschikbaar.`,
                              });
                            }}
                            variant="outline"
                            size="sm"
                            className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Verwijderen
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'add' && (
          <div>
            <div className="flex items-center mb-6">
              <Calendar className="mr-2 h-5 w-5 text-red-600" />
              <h2 className="text-xl font-semibold">
                {formData.id ? 'Les Bewerken' : 'Nieuwe Les Toevoegen'}
              </h2>
            </div>
            
            <form onSubmit={handleAddClass} className="bg-zinc-900 rounded-lg p-6 space-y-6">
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
                    setFormData({
                      id: null,
                      title: '',
                      time: '',
                      trainer: '',
                      spots: 15,
                      day: 1, // Wordt automatisch berekend
                      date: new Date().toISOString().split('T')[0],
                      description: 'Een nieuwe fitness les'
                    });
                  }}
                >
                  Annuleren
                </Button>
                <Button type="submit" className="bg-red-600 hover:bg-red-700">
                  {formData.id ? 'Les Bijwerken' : 'Les Toevoegen'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;