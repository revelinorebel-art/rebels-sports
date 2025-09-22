import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, Clock, Users, Zap, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import EditClassModal from '@/components/EditClassModal';
import { v4 as uuidv4 } from 'uuid';

const initialClassesData = [
  { id: uuidv4(), name: 'Zumba', time: '09:00 - 10:00', day: 1, trainer: 'Maria Garcia', spots: 15, image: 'Een energieke Zumba les met dansende mensen' },
  { id: uuidv4(), name: 'Fitness', time: '10:30 - 11:30', day: 1, trainer: 'John Doe', spots: 20, image: 'Mensen die aan het gewichtheffen zijn in een fitnessruimte' },
  { id: uuidv4(), name: 'Yoga', time: '17:00 - 18:00', day: 1, trainer: 'Anna Lee', spots: 12, image: 'Groep in een rustige yoga pose' },
  { id: uuidv4(), name: 'Latin Dance', time: '19:00 - 20:00', day: 2, trainer: 'Carlos Ruiz', spots: 18, image: 'Koppels die Latin dansen' },
  { id: uuidv4(), name: 'Fitness', time: '09:00 - 10:00', day: 2, trainer: 'John Doe', spots: 20, image: 'Mensen op loopbanden in de sportschool' },
  { id: uuidv4(), name: 'Zumba', time: '18:00 - 19:00', day: 3, trainer: 'Maria Garcia', spots: 15, image: 'Close-up van dansende voeten in een Zumba les' },
  { id: uuidv4(), name: 'Yoga', time: '08:00 - 09:00', day: 4, trainer: 'Anna Lee', spots: 12, image: 'Zonsopgang yoga sessie' },
  { id: uuidv4(), name: 'Latin Dance', time: '20:00 - 21:00', day: 5, trainer: 'Carlos Ruiz', spots: 18, image: 'Vrolijke mensen die salsa dansen' },
  { id: uuidv4(), name: 'Fitness', time: '17:00 - 18:00', day: 5, trainer: 'John Doe', spots: 20, image: 'Een high-intensity interval training (HIIT) sessie' },
];

const CalendarSection = ({ isAdminMode }) => {
  const [classes, setClasses] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState([]);
  const [selectedDay, setSelectedDay] = useState(currentDate.getDay());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);

  useEffect(() => {
    try {
      const storedClasses = localStorage.getItem('rebelsClasses');
      if (storedClasses) {
        setClasses(JSON.parse(storedClasses));
      } else {
        // Migreer oude data als die bestaat
        const oldClasses = localStorage.getItem('fitzoneClasses');
        if (oldClasses) {
          const parsedOldClasses = JSON.parse(oldClasses);
          setClasses(parsedOldClasses);
          localStorage.setItem('rebelsClasses', oldClasses);
          localStorage.removeItem('fitzoneClasses');
        } else {
          setClasses(initialClassesData);
          localStorage.setItem('rebelsClasses', JSON.stringify(initialClassesData));
        }
      }
    } catch (error) {
      console.error("Failed to parse classes from localStorage", error);
      setClasses(initialClassesData);
      localStorage.setItem('rebelsClasses', JSON.stringify(initialClassesData));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('rebelsClasses', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = currentDate.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust to make Monday the start of the week
    startOfWeek.setDate(currentDate.getDate() + diff);

    const dates = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
    setWeekDates(dates);
    // When week changes, keep selected day if possible, otherwise default to today or monday
    const today = new Date();
    if (today >= dates[0] && today <= dates[6]) {
        setSelectedDay(today.getDay());
    } else {
        setSelectedDay(1); // Default to Monday
    }
  }, [currentDate]);

  const handlePrevWeek = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() - 7);
      return newDate;
    });
  };

  const handleNextWeek = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + 7);
      return newDate;
    });
  };

  const handleSignUp = (classId) => {
    setClasses(prevClasses => 
        prevClasses.map(cls => {
            if (cls.id === classId && cls.spots > 0) {
                toast({
                    title: "✅ Ingeschreven!",
                    description: `Je hebt je succesvol ingeschreven voor ${cls.name}. We zien je daar!`,
                });
                return { ...cls, spots: cls.spots - 1 };
            }
            if (cls.id === classId && cls.spots === 0) {
                 toast({
                    title: "😕 Les is vol!",
                    description: `Sorry, er zijn geen plekken meer voor ${cls.name}.`,
                    variant: "destructive"
                });
            }
            return cls;
        })
    );
  };
  
  const handleAddClass = () => {
    setEditingClass(null);
    setIsModalOpen(true);
  };

  const handleEditClass = (cls) => {
    setEditingClass(cls);
    setIsModalOpen(true);
  };

  const handleDeleteClass = (id) => {
    setClasses(classes.filter(c => c.id !== id));
    toast({
      title: "🗑️ Les verwijderd",
      description: "De les is succesvol uit het rooster verwijderd.",
      variant: "destructive",
    });
  };

  const handleSaveClass = (classData) => {
    if (classData.id) {
      setClasses(classes.map(c => c.id === classData.id ? classData : c));
      toast({ title: "👍 Les bijgewerkt!", description: "De lesdetails zijn succesvol opgeslagen." });
    } else {
      setClasses([...classes, { ...classData, id: uuidv4() }]);
      toast({ title: "✨ Les toegevoegd!", description: "De nieuwe les staat nu in het rooster." });
    }
  };

  const dayNames = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];
  
  // Filter lessen op basis van geselecteerde datum
  const filteredClasses = classes.filter(c => {
    // Als de les een datum heeft, gebruik die voor filtering
    if (c.date) {
      const selectedDateObj = weekDates.find(d => d.getDay() === selectedDay);
      const formattedSelectedDate = selectedDateObj ? selectedDateObj.toISOString().split('T')[0] : '';
      return c.date === formattedSelectedDate;
    }
    // Anders val terug op de oude methode (dag van de week)
    return c.day === selectedDay;
  });

  return (
    <section id="calendar" className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-white/20"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-2">
                <Button onClick={handlePrevWeek} variant="outline" className="border-white text-white hover:bg-white/20">
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button onClick={handleNextWeek} variant="outline" className="border-white text-white hover:bg-white/20">
                    <ChevronRight className="h-5 w-5" />
                </Button>
            </div>
            <h3 className="text-xl md:text-2xl font-semibold text-white order-first sm:order-none">
              {weekDates[0]?.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}
            </h3>
            {isAdminMode && (
              <Button onClick={handleAddClass} className="bg-red-600 hover:bg-red-700 text-white font-semibold">
                <Plus className="mr-2 h-4 w-4" /> Les Toevoegen
              </Button>
            )}
          </div>

          <div className="grid grid-cols-7 gap-2 md:gap-4 mb-8">
            {weekDates.map((date, index) => (
              <div
                key={date.toISOString()}
                onClick={() => setSelectedDay(date.getDay())}
                className={`text-center p-2 md:p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                  selectedDay === date.getDay()
                    ? 'bg-gradient-to-r from-red-600 to-red-700 scale-105 shadow-lg shadow-red-500/20'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                <p className="text-sm md:text-base font-medium text-gray-300">{dayNames[index]}</p>
                <p className="text-lg md:text-2xl font-bold text-white">{date.getDate()}</p>
              </div>
            ))}
          </div>

          <div>
            <h4 className="text-2xl font-bold text-white mb-6">
              Lessen op {dayNames[weekDates.findIndex(d => d.getDay() === selectedDay)] || ''}, {weekDates.find(d => d.getDay() === selectedDay)?.getDate() || ''} {weekDates.find(d => d.getDay() === selectedDay)?.toLocaleDateString('nl-NL', { month: 'long' }) || ''}
            </h4>
            {filteredClasses.length > 0 ? (
              <div className="space-y-4">
                {filteredClasses.map((cls, index) => (
                  <motion.div
                    key={cls.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white/5 p-4 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4 border border-transparent hover:border-red-600 transition-colors"
                  >
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="hidden sm:block">
                        <img  class="h-16 w-16 rounded-md object-cover" alt={cls.image} src="https://images.unsplash.com/photo-1595872018818-97555653a011" />
                      </div>
                      <div>
                        <h5 className="text-xl font-semibold text-white">{cls.name}</h5>
                        <p className="text-red-400">met {cls.trainer}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-gray-300">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-red-500" />
                        <span>{cls.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-red-500" />
                        <span>{cls.spots} plekken</span>
                      </div>
                    </div>
                    {isAdminMode ? (
                      <div className="flex gap-2">
                        <Button onClick={() => handleEditClass(cls)} size="icon" variant="outline" className="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-white">
                          <Edit className="h-4 w-4"/>
                        </Button>
                        <Button onClick={() => handleDeleteClass(cls.id)} size="icon" variant="outline" className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white">
                          <Trash2 className="h-4 w-4"/>
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleSignUp(cls.id)}
                        disabled={cls.spots === 0}
                        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {cls.spots === 0 ? "Volgeboekt" : <><Zap className="mr-2 h-4 w-4" /> Inschrijven</>}
                      </Button>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white/5 rounded-lg">
                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h5 className="text-xl font-semibold text-white">Geen lessen gepland</h5>
                <p className="text-gray-400">{isAdminMode ? "Voeg een nieuwe les toe voor deze dag!" : "Neem een rustdag of train op eigen houtje!"}</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      <EditClassModal 
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        classData={editingClass}
        onSave={handleSaveClass}
        selectedDay={selectedDay}
      />
    </section>
  );
};

export default CalendarSection;