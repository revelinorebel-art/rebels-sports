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

  useEffect(() => {
    if (classData) {
      setFormData(classData);
    } else {
      setFormData({
        id: null,
        name: '',
        time: '',
        trainer: '',
        spots: 15,
        day: selectedDay,
        date: '',
        image: 'Een nieuwe fitness les'
      });
    }
  }, [classData, selectedDay, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'spots' ? Number(value) : value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setIsOpen(false);
  };

  const dayNames = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];

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
              <Label htmlFor="day" className="text-right">Dag</Label>
                <Select onValueChange={(value) => handleSelectChange('day', Number(value))} value={String(formData.day)}>
                    <SelectTrigger className="col-span-3 bg-slate-700 border-slate-600">
                        <SelectValue placeholder="Kies een dag" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 text-white border-slate-700">
                        {dayNames.map((day, index) => (
                            <SelectItem key={index} value={String(index)}>{day}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
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