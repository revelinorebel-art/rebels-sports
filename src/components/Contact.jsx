import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        variant: "destructive",
        title: "Oh oh! Er ging iets mis.",
        description: "Vul alsjeblieft alle verplichte velden in.",
      });
      return;
    }

    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Bericht verzonden! 🚀",
        description: "Bedankt voor je bericht. We nemen zo snel mogelijk contact op.",
      });
      setFormData({ name: '', email: '', phone: '', message: '' });
    }, 1500);
  };

  return (
    <section id="contact" className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Kom Langs Voor Een <span className="text-red-600">Proefles</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Ervaar zelf wat Rebels Sports te bieden heeft. Boek vandaag nog je gratis proefles!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="flex items-center space-x-4">
              <MapPin className="h-6 w-6 text-red-600" />
              <div>
                <h3 className="text-lg font-semibold text-white">Adres</h3>
                <p className="text-gray-300">Sportlaan 123, 1234 AB Amsterdam</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Phone className="h-6 w-6 text-red-600" />
              <div>
                <h3 className="text-lg font-semibold text-white">Telefoon</h3>
                <p className="text-gray-300">020 - 123 4567</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Mail className="h-6 w-6 text-red-600" />
              <div>
                <h3 className="text-lg font-semibold text-white">Email</h3>
                <p className="text-gray-300">info@rebelssports.nl</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Clock className="h-6 w-6 text-red-600" />
              <div>
                <h3 className="text-lg font-semibold text-white">Openingstijden</h3>
                <p className="text-gray-300">Ma-Vr: 06:00 - 23:00<br />Za-Zo: 08:00 - 20:00</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10"
          >
            <h3 className="text-2xl font-bold text-white mb-6">Stuur ons een bericht</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input 
                type="text" 
                name="name"
                placeholder="Jouw naam *" 
                value={formData.name}
                onChange={handleInputChange}
                className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-red-600"
              />
              <Input 
                type="email" 
                name="email"
                placeholder="Email adres *" 
                value={formData.email}
                onChange={handleInputChange}
                className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-red-600"
              />
              <Input 
                type="tel" 
                name="phone"
                placeholder="Telefoonnummer" 
                value={formData.phone}
                onChange={handleInputChange}
                className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-red-600"
              />
              <textarea 
                name="message"
                placeholder="Vertel ons over je fitness doelen... *" 
                rows="4"
                value={formData.message}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-600 resize-none"
              ></textarea>
              <Button 
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Bezig met verzenden...' : <>
                  <Send className="mr-2 h-5 w-5" />
                  Verstuur Bericht
                </>}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;