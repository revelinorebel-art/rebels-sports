import React, { useState } from 'react';
import { X, User, Mail, Phone, Calendar, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const RegistrationModal = ({ isOpen, onClose, classInfo, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      alert('Vul alle velden in');
      return;
    }

    if (!formData.email.includes('@')) {
      alert('Voer een geldig email adres in');
      return;
    }

    if (formData.phone.trim().length < 10) {
      alert('Voer een geldig telefoonnummer in (minimaal 10 cijfers)');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit({
        ...formData,
        classId: classInfo.id,
        className: classInfo.name,
        classTime: classInfo.time,
        classDate: classInfo.date || new Date().toLocaleDateString('nl-NL'),
        timestamp: new Date().toISOString()
      });
      
      // Reset form
      setFormData({ name: '', email: '', phone: '' });
      onClose();
    } catch (error) {
      console.error('Error submitting registration:', error);
      alert('Er is een fout opgetreden. Probeer het opnieuw.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Inschrijven voor les
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Class Info */}
        <div className="p-6 border-b bg-gray-50">
          <h3 className="font-semibold text-lg text-gray-900 mb-2">
            {classInfo?.name}
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{classInfo?.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>{classInfo?.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={16} />
              <span>{classInfo?.spots} plekken beschikbaar</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Volledige naam *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                  placeholder="Voer je volledige naam in"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email adres *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                  placeholder="voornaam@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Telefoonnummer *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                  placeholder="06 12345678"
                  required
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Annuleren
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Bezig...' : 'Inschrijven'}
            </Button>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 pb-6 text-xs text-gray-500">
          * Verplichte velden. Je ontvangt een bevestigingsmail na inschrijving.
        </div>
      </div>
    </div>
  );
};

export default RegistrationModal;