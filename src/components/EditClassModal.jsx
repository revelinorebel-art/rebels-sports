import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const EditClassModal = ({ isOpen, setIsOpen, classData, onSave, selectedDay }) => {
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    time: '',
    trainer: '',
    spots: '',
    day: selectedDay,
    date: '',
    image: 'Een generieke fitness les'
  });

  // Dagen van de week in het formaat dat de database verwacht
  // In de database: 0 = Zondag, 1 = Maandag, etc.
  const dayNames = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];

  useEffect(() => {
    if (classData) {
      // Als we een bestaande les bewerken
      setFormData(classData);
    } else {
      // Als we een nieuwe les toevoegen
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];
      
      // Bepaal de dag van de week (0 = Zondag, 1 = Maandag, etc.)
      const dayOfWeek = today.getDay(); // JavaScript: 0 = Zondag, 1 = Maandag, etc.
      
      setFormData({
        id: null,
        name: '',
        time: '',
        trainer: '',
        spots: 15,
        // Gebruik de geselecteerde dag als die is meegegeven, anders de huidige dag
        day: selectedDay !== undefined ? selectedDay : dayOfWeek,
        date: formattedDate,
        image: 'Een nieuwe fitness les'
      });
    }
  }, [classData, selectedDay, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Als het datumveld wordt gewijzigd, update ook de dag van de week
    if (name === 'date' && value) {
      const selectedDate = new Date(value);
      // JavaScript: 0 = Zondag, 1 = Maandag, etc.
      const dayOfWeek = selectedDate.getDay();
      
      console.log(`Geselecteerde datum: ${value}, berekende dag: ${dayOfWeek} (${dayNames[dayOfWeek]})`);
      
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        day: dayOfWeek // Sla de dag op in het formaat dat de database verwacht
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: name === 'spots' ? Number(value) : value }));
    }
  };

  // Als de dag handmatig wordt gewijzigd via de dropdown
  const handleSelectChange = (name, value) => {
    const numericValue = Number(value);
    console.log(`Dag handmatig gewijzigd naar: ${numericValue} (${dayNames[numericValue]})`);
    setFormData(prev => ({ ...prev, [name]: numericValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Log de gegevens voordat we ze opslaan
    console.log("Les opslaan met de volgende gegevens:", {
      ...formData,
      dayName: dayNames[formData.day]
    });
    
    onSave(formData);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>{classData ? 'Les Bewerken' : 'Nieuwe Les Toevoegen'}</DialogTitle>
          <DialogDescription>
            {classData ? 'Pas de details van de les aan.' : 'Voeg een nieuwe les toe aan het rooster.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Lesnaam</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} className="col-span-3 bg-slate-700 border-slate-600" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right">Tijd</Label>
              <Input id="time" name="time" type="text" value={formData.time} onChange={handleChange} placeholder="bv. 09:00 - 10:00" className="col-span-3 bg-slate-700 border-slate-600" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="trainer" className="text-right">Trainer</Label>
              <Input id="trainer" name="trainer" value={formData.trainer} onChange={handleChange} className="col-span-3 bg-slate-700 border-slate-600" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="spots" className="text-right">Plekken</Label>
              <Input id="spots" name="spots" type="number" value={formData.spots} onChange={handleChange} className="col-span-3 bg-slate-700 border-slate-600" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">Datum</Label>
              <Input 
                id="date" 
                name="date" 
                type="date" 
                value={formData.date} 
                onChange={handleChange} 
                className="col-span-3 bg-slate-700 border-slate-600 text-white" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="day" className="text-right">Dag</Label>
                <Select 
                  onValueChange={(value) => handleSelectChange('day', value)} 
                  value={String(formData.day)}
                  disabled={formData.date ? true : false} // Uitgeschakeld als er een datum is geselecteerd
                >
                    <SelectTrigger className="col-span-3 bg-slate-700 border-slate-600">
                        <SelectValue placeholder="Kies een dag">
                          {formData.day !== undefined && formData.day !== null ? dayNames[formData.day] : "Kies een dag"}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 text-white border-slate-700">
                        {dayNames.map((day, index) => (
                            <SelectItem key={index} value={String(index)}>{day}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {formData.date && (
              <div className="text-sm text-orange-400 mt-2">
                Datum geselecteerd: {formData.date} ({dayNames[formData.day]})
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600">Opslaan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditClassModal;