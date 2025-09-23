import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import RegistrationModal from '@/components/RegistrationModal';
import { sendRegistrationEmail, sendOwnerNotification } from '@/services/emailService';
import apiService from '@/services/apiService';

const GroepslessenPage = () => {
  const [classes, setClasses] = useState([]);
  const [reservations, setReservations] = useState({});
  const [selectedDay, setSelectedDay] = useState(1); // 1 = Maandag
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const { toast } = useToast();

  // Functie om reserveringen te laden
  const loadReservations = async () => {
    try {
      const response = await apiService.getReservations();
      if (response.success) {
        // Groepeer reserveringen per les en datum
        const reservationCounts = {};
        response.data.forEach(reservation => {
          // Gebruik dezelfde key format als in capaciteitsberekening
          const lessonId = reservation.lesson_id || reservation.classId;
          const lessonDate = reservation.lesson_date || reservation.classDate;
          const key = `${lessonId}-${lessonDate}`;
          reservationCounts[key] = (reservationCounts[key] || 0) + 1;
        });
        setReservations(reservationCounts);
      } else {
        console.error("Failed to load reservations:", response.error);
        setReservations({});
      }
    } catch (error) {
      console.error("Failed to load reservations:", error);
      setReservations({});
    }
  };

  // Functie om lessen te laden/herladen
  const loadClasses = async () => {
    try {
      const response = await apiService.getLessons();
      
      if (response.success) {
        // Converteer database format naar frontend format
        const formattedClasses = response.data.map(lesson => 
          apiService.formatLessonForFrontend(lesson)
        );
        setClasses(formattedClasses);
      } else {
        console.error("Failed to load classes:", response.error);
        setClasses([]);
        toast({
          title: "Database fout",
          description: "Kon lessen niet laden uit database.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Failed to load classes from database:", error);
      setClasses([]);
      toast({
        title: "Verbindingsfout",
        description: "Kon geen verbinding maken met de database.",
        variant: "destructive"
      });
    }
  };

  // Laad lessen uit database
  useEffect(() => {
    loadClasses();
    loadReservations();
    
    // Stel de huidige dag in als standaard
    const today = new Date();
    const dayOfWeek = today.getDay();
    setSelectedDay(dayOfWeek === 0 ? 7 : dayOfWeek);
  }, []);

  // Auto-synchronisatie wanneer gebruiker terugkeert naar de pagina
  useEffect(() => {
    const handleFocus = () => {
      console.log("GroepslessenPage focused - refreshing lessons for synchronization");
      loadClasses();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("GroepslessenPage became visible - refreshing lessons for synchronization");
        loadClasses();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Real-time synchronisatie met event listeners
  useEffect(() => {
    const handleLessonsUpdated = () => {
      console.log('Lessen bijgewerkt - synchroniseren frontend weekrooster');
      loadClasses();
    };

    const handleReservationsUpdated = () => {
      console.log('Reserveringen bijgewerkt - synchroniseren frontend weekrooster');
      loadReservations();
    };

    // Luister naar custom events van de mock data store
    window.addEventListener('lessonsUpdated', handleLessonsUpdated);
    window.addEventListener('reservationsUpdated', handleReservationsUpdated);

    return () => {
      window.removeEventListener('lessonsUpdated', handleLessonsUpdated);
      window.removeEventListener('reservationsUpdated', handleReservationsUpdated);
    };
  }, []);

  // Dagen van de week
  const dayNames = [
    { short: 'Ma', full: 'Maandag', value: 1 },
    { short: 'Di', full: 'Dinsdag', value: 2 },
    { short: 'Wo', full: 'Woensdag', value: 3 },
    { short: 'Do', full: 'Donderdag', value: 4 },
    { short: 'Vr', full: 'Vrijdag', value: 5 },
    { short: 'Za', full: 'Zaterdag', value: 6 },
    { short: 'Zo', full: 'Zondag', value: 7 }
  ];

  // Bereken de datum voor elke dag van de week
  const getWeekDates = () => {
    const startOfWeek = new Date(currentWeek);
    const dayOfWeek = currentWeek.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startOfWeek.setDate(currentWeek.getDate() + diff);

    return dayNames.map((day, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      return {
        ...day,
        date: date.getDate(),
        month: date.getMonth() + 1,
        fullDate: date
      };
    });
  };

  const weekDates = getWeekDates();

  // Genereer lessen voor de geselecteerde dag (herhalend voor elke week)
  const getClassesForSelectedDay = () => {
    const selectedDate = weekDates.find(d => d.value === selectedDay)?.fullDate;
    if (!selectedDate) return [];

    const dateString = selectedDate.toISOString().split('T')[0];

    // Filter lessen op basis van geselecteerde dag van de week (herhalende lessen)
    const dayClasses = classes.filter(cls => cls.day === selectedDay);
    
    // Filter lessen met specifieke datum die overeenkomt met de geselecteerde datum
    const specificDateClasses = classes.filter(cls => 
      cls.specific_date === dateString && !cls.day
    );
    
    // Combineer herhalende lessen en specifieke datum lessen
    const allClasses = [...dayClasses, ...specificDateClasses];
    
    // Genereer unieke lessen voor deze specifieke datum
    return allClasses.map(cls => {
      const dateSpecificId = cls.specific_date ? cls.id : `${cls.id}-${dateString}`;
      
      // Bereken beschikbare plekken op basis van reserveringen
      // Gebruik dezelfde key format als in loadReservations: lessonId-lessonDate
      const reservationKey = `${cls.id}-${dateString}`;
      const reservedSpots = reservations[reservationKey] || 0;
      const availableSpots = Math.max(0, cls.spots - reservedSpots);
      
      return {
        ...cls,
        id: dateSpecificId, // Unieke ID per datum
        originalId: cls.id, // Bewaar originele ID
        date: dateString, // Voeg datum toe
        availableSpots: availableSpots, // Beschikbare plekken
        totalSpots: cls.spots, // Bewaar originele aantal plekken
        reservedSpots: reservedSpots, // Aantal gereserveerde plekken
        displayDate: selectedDate.toLocaleDateString('nl-NL', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      };
    });
  };

  const filteredClasses = getClassesForSelectedDay();

  // Sorteer lessen op tijd
  const sortedClasses = filteredClasses.sort((a, b) => {
    const timeA = a.time.split(' - ')[0];
    const timeB = b.time.split(' - ')[0];
    return timeA.localeCompare(timeB);
  });

  // Functie om de inschrijfmodal te openen
  const openRegistrationModal = (classItem) => {
    // Controleer of de les vol is
    if (classItem.availableSpots <= 0) {
      toast({
        title: "Les is vol",
        description: "Deze les heeft geen beschikbare plekken meer. Probeer een andere les of datum.",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedClass(classItem);
    setIsModalOpen(true);
  };

  // Functie om inschrijving te verwerken
  const handleRegistration = async (registrationData) => {
    try {
      // Converteer registratie data naar database format
      const reservationData = apiService.formatReservationForDatabase(registrationData);
      
      // Sla reservering op in database
      const response = await apiService.createReservation(reservationData);
      
      if (response.success) {
        // Verstuur email notificatie
        await sendEmailNotification(registrationData);

        toast({
          title: "Inschrijving bevestigd!",
          description: `Hallo ${registrationData.name}, je bent ingeschreven voor ${registrationData.className}. Check je email voor de bevestiging.`,
        });

        // Herlaad reserveringen om bijgewerkte beschikbare plekken te tonen
         await loadReservations();
      } else {
        throw new Error(response.error || 'Reservering mislukt');
      }
    } catch (error) {
      console.error('Error processing registration:', error);
      
      toast({
        title: "Reservering mislukt",
        description: "Er is een fout opgetreden bij het verwerken van je reservering. Probeer het opnieuw of neem contact op.",
        variant: "destructive"
      });
    }
  };

  // Echte email notificatie via EmailJS
  const sendEmailNotification = async (registrationData) => {
    try {
      // Verstuur bevestigingsmail naar klant
      await sendRegistrationEmail(registrationData);
      console.log('Bevestigingsmail verzonden naar:', registrationData.email);
      
      // Verstuur notificatie naar gym eigenaar
      await sendOwnerNotification(registrationData);
      console.log('Notificatie verzonden naar gym eigenaar');
      
    } catch (error) {
      console.error('Fout bij verzenden emails:', error);
      // Gooi de error niet opnieuw op zodat de inschrijving wel wordt opgeslagen
      // maar laat de gebruiker weten dat er een probleem was met de email
      toast({
        title: "Email probleem",
        description: "Je inschrijving is opgeslagen, maar er was een probleem met het verzenden van de bevestigingsmail. Neem contact op als je geen bevestiging ontvangt.",
        variant: "destructive"
      });
    }
  };

  // Navigatie functies
  const goToPreviousWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() - 7);
    setCurrentWeek(newWeek);
  };

  const goToNextWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + 7);
    setCurrentWeek(newWeek);
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(new Date());
    const today = new Date();
    const dayOfWeek = today.getDay();
    setSelectedDay(dayOfWeek === 0 ? 7 : dayOfWeek);
  };

  return (
    <div className="pt-20 bg-black min-h-screen">
      <Helmet>
        <title>Groepslessen Rooster - Rebels Sports</title>
        <meta name="description" content="Bekijk ons lesrooster en schrijf je in voor energieke groepslessen zoals Zumba, Yoga en meer bij Rebels Sports." />
        <meta property="og:title" content="Groepslessen Rooster - Rebels Sports" />
        <meta property="og:description" content="Bekijk ons lesrooster en schrijf je in voor energieke groepslessen zoals Zumba, Yoga en meer bij Rebels Sports." />
      </Helmet>

      {/* Hero Section */}
      <div className="bg-black text-white pt-12 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center px-4"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Groepslessen <span className="text-red-600">Rooster</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Vind je favoriete les en reserveer je plek. Laten we samen bewegen!
          </p>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-800 text-white p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Calendar className="mr-3 h-8 w-8" />
                <div>
                  <h2 className="text-2xl font-bold">Weekrooster</h2>
                  <p className="text-red-100">Selecteer een dag om de lessen te bekijken</p>
                </div>
              </div>
              <Button 
                onClick={goToCurrentWeek}
                variant="outline" 
                className="bg-white/20 border-white/40 text-white hover:bg-white/30 font-semibold px-4 py-2 shadow-lg"
              >
                🏠 Vandaag
              </Button>
            </div>
          </div>

          {/* Week Navigation */}
          <div className="bg-gray-50 p-6 border-b">
            <div className="flex justify-between items-center mb-4">
              <Button
                variant="outline"
                onClick={goToPreviousWeek}
                className="flex items-center bg-white border-2 border-gray-300 hover:bg-red-50 hover:border-red-300 transition-colors px-4 py-2 shadow-sm text-black"
              >
                <ChevronLeft className="mr-2 h-5 w-5 text-black" />
                Vorige week
              </Button>
              
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800">
                  Week van {weekDates[0].date}/{weekDates[0].month} - {weekDates[6].date}/{weekDates[6].month}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {weekDates[0].fullDate.getFullYear()}
                </p>
              </div>
              
              <Button
                variant="outline"
                onClick={goToNextWeek}
                className="flex items-center bg-white border-2 border-gray-300 hover:bg-red-50 hover:border-red-300 transition-colors px-4 py-2 shadow-sm text-black"
              >
                Volgende week
                <ChevronRight className="ml-2 h-5 w-5 text-black" />
              </Button>
            </div>

            {/* Day Selector */}
            <div className="grid grid-cols-7 gap-2">
              {weekDates.map((day) => {
                const isToday = new Date().toDateString() === day.fullDate.toDateString();
                const isPast = day.fullDate < new Date().setHours(0, 0, 0, 0);
                const isSelected = selectedDay === day.value;
                
                return (
                  <button
                    key={day.value}
                    onClick={() => setSelectedDay(day.value)}
                    className={`p-3 rounded-lg text-center transition-all duration-200 relative ${
                      isSelected
                        ? 'bg-red-600 text-white shadow-lg transform scale-105'
                        : isToday
                        ? 'bg-blue-100 text-blue-800 border-2 border-blue-300 hover:bg-blue-200'
                        : isPast
                        ? 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 hover:border-red-300'
                    }`}
                  >
                    <div className="font-semibold">{day.short}</div>
                    <div className="text-sm">{day.date}/{day.month}</div>
                    {isToday && !isSelected && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Classes List */}
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div className="flex items-center mb-2 md:mb-0">
                <h3 className="text-2xl font-bold text-gray-800">
                  {dayNames.find(d => d.value === selectedDay)?.full}
                </h3>
                <span className="ml-3 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                  {sortedClasses.length} {sortedClasses.length === 1 ? 'les' : 'lessen'}
                </span>
              </div>

            </div>

            {sortedClasses.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Calendar className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <h4 className="text-xl font-semibold text-gray-600 mb-2">
                  {classes.length === 0 ? 'Nog geen lessen toegevoegd' : 'Geen lessen gepland'}
                </h4>
                <p className="text-gray-500">
                  {classes.length === 0 
                    ? 'Er zijn nog geen lessen toegevoegd aan het rooster.'
                    : `Er zijn geen lessen gepland voor ${dayNames.find(d => d.value === selectedDay)?.full.toLowerCase()}.`
                  }
                </p>
              </motion.div>
            ) : (
              <div className="grid gap-4">
                {sortedClasses.map((cls, index) => (
                  <motion.div
                    key={cls.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-l-red-600"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-gray-800 mb-2">
                          {cls.title}
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4 text-red-600" />
                            <span className="font-medium">{cls.time}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <Users className="mr-2 h-4 w-4 text-red-600" />
                            <span>{cls.trainer}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <MapPin className="mr-2 h-4 w-4 text-red-600" />
                            <span>
                              {cls.availableSpots > 0 
                                ? `${cls.availableSpots} van ${cls.totalSpots} plekken beschikbaar`
                                : 'VOL'
                              }
                            </span>
                          </div>
                        </div>

                        {cls.description && (
                          <p className="mt-3 text-gray-600 italic">
                            {cls.description}
                          </p>
                        )}
                      </div>

                      <div className="mt-4 md:mt-0 md:ml-6">
                        <Button
                          onClick={() => openRegistrationModal(cls)}
                          disabled={cls.availableSpots <= 0}
                          className={`w-full md:w-auto ${
                            cls.availableSpots <= 0
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-red-600 hover:bg-red-700'
                          }`}
                        >
                          {cls.availableSpots <= 0 ? 'VOL' : 'Inschrijven'}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 bg-gray-900 rounded-xl p-6 text-white max-w-6xl mx-auto"
        >
          <h3 className="text-xl font-bold mb-4">Reservering Informatie</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-red-400 mb-2">Reserveren</h4>
              <ul className="space-y-1 text-gray-300">
                <li>• Klik op "Reserveer Nu" om je plek te boeken</li>
                <li>• Reserveringen zijn direct bevestigd</li>
                <li>• Kom 15 minuten voor de les aan</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-red-400 mb-2">Belangrijk</h4>
              <ul className="space-y-1 text-gray-300">
                <li>• Breng je eigen handdoek en water mee</li>
                <li>• Draag sportkleding en sportschoenen</li>
                <li>• Bij ziekte, annuleer tijdig je reservering (bel of mail)</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Registration Modal */}
      <RegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        classInfo={selectedClass}
        onSubmit={handleRegistration}
      />
    </div>
  );
};

export default GroepslessenPage;