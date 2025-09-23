import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Pencil, Save, CheckCircle, Dumbbell, Leaf, Zap, HeartPulse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import apiService from '@/services/apiService';

const initialServicesData = [
  {
    id: 'personal-training',
    title: "Personal Training",
    description: "Bereik je doelen sneller met 1-op-1 begeleiding. Onze personal trainers maken een plan op maat, focussen op techniek en zorgen voor de motivatie die je nodig hebt om door te breken.",
    image: "Een personal trainer begeleidt een klant met gewichten in een goed uitgeruste sportschool",
    icon: Dumbbell,
    features: ["Persoonlijk trainingsplan", "Voortgangsmeting", "Flexibele planning", "Focus op techniek & veiligheid"]
  },
  {
    id: 'groepslessen',
    title: "Groepslessen",
    description: "Voel de energie in onze dynamische groepslessen! Van explosieve HIIT en krachtige Zumba tot rustgevende Yoga. Er is altijd een les die bij je past, geleid door onze motiverende instructeurs.",
    image: "Diverse groep mensen volgt enthousiast een groepsles in een lichte, moderne studio",
    icon: Zap,
    features: ["Dagelijks meerdere lessen", "Geschikt voor alle niveaus", "Gecertificeerde instructeurs", "Community gevoel"]
  },
  {
    id: 'voedingsadvies',
    title: "Voedingsadvies",
    description: "Voeding is de brandstof voor je lichaam. Onze experts helpen je met een praktisch en effectief voedingsplan dat past bij jouw levensstijl, of je nu wilt afvallen, spiermassa wilt opbouwen of gewoon gezonder wilt leven.",
    image: "Kleurrijke en gezonde maaltijd met groenten, fruit en magere eiwitten",
    icon: Leaf,
    features: ["Analyse van eetpatroon", "Praktische eetschema's", "Supplementenadvies", "Ondersteuning en bijsturing"]
  },
  {
    id: 'wellness',
    title: "Wellness & Sauna",
    description: "Herstel is net zo belangrijk als de training zelf. Ontspan je spieren en geest in onze luxe wellness. Geniet van de Finse sauna, infraroodcabine en onze rustgevende relaxruimte.",
    image: "Een serene en luxe wellness-ruimte met een sauna en comfortabele ligstoelen",
    icon: HeartPulse,
    features: ["Finse sauna & infrarood", "Stoomcabine", "Relaxruimte", "Verbeterd spierherstel"]
  }
];

const ServiceSection = ({ service, isAdminMode, onEdit, index }) => {
  const Icon = service.icon;
  const isReversed = index % 2 !== 0;

  return (
    <div id={service.id} className="py-16 sm:py-24 overflow-hidden bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid md:grid-cols-2 gap-12 items-center`}>
          <motion.div
            className={`relative ${isReversed ? 'md:order-2' : 'md:order-1'}`}
            initial={{ opacity: 0, x: isReversed ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <div className="aspect-w-4 aspect-h-3 rounded-2xl overflow-hidden shadow-2xl shadow-red-900/20">
              <img  class="w-full h-full object-cover" alt={service.image} src="https://images.unsplash.com/photo-1595872018818-97555653a011" />
            </div>
            {isAdminMode && (
              <Button
                onClick={() => onEdit(service)}
                className="absolute -top-4 -right-4 z-20 bg-red-600 hover:bg-red-700 text-white rounded-full"
                size="icon"
              >
                <Pencil className="h-5 w-5" />
              </Button>
            )}
          </motion.div>
          <motion.div
            className={`${isReversed ? 'md:order-1' : 'md:order-2'}`}
            initial={{ opacity: 0, x: isReversed ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-red-600/20 p-3 rounded-full border-2 border-red-600">
                <Icon className="h-8 w-8 text-red-500" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white">{service.title}</h2>
            </div>
            <p className="text-lg text-gray-300 mb-6">{service.description}</p>
            <ul className="space-y-3">
              {service.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
                  <span className="text-gray-200">{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const ServicesPage = ({ isAdminMode }) => {
  const [services, setServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const { toast } = useToast();

  const loadServices = async () => {
    try {
      const servicesData = await apiService.getServices();
      if (servicesData && servicesData.length > 0) {
        setServices(servicesData);
      } else {
        setServices(initialServicesData);
      }
    } catch (error) {
      console.error("Failed to load services from database:", error);
      setServices(initialServicesData);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleEditClick = (service) => {
    setCurrentService(service);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      await apiService.updateService(currentService);
      setServices(services.map(s => s.id === currentService.id ? currentService : s));
      setIsModalOpen(false);
      setCurrentService(null);
      toast({
        title: "Service bijgewerkt",
        description: "De service is succesvol bijgewerkt.",
      });
    } catch (error) {
      console.error("Failed to update service:", error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het bijwerken van de service.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentService(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-black text-white">
      <Helmet>
        <title>Onze Diensten - Rebels Sports</title>
        <meta name="description" content="Ontdek het brede aanbod aan diensten bij Rebels Sports. Van groepslessen en personal training tot wellness en voedingsadvies." />
        <meta property="og:title" content="Onze Diensten - Rebels Sports" />
        <meta property="og:description" content="Ontdek het brede aanbod aan diensten bij Rebels Sports. Van groepslessen en personal training tot wellness en voedingsadvies." />
      </Helmet>

      <div className="pt-24 pb-12 bg-black">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center px-4"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Onze <span className="text-red-600">Diensten</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Alles wat je nodig hebt om je fitnessdoelen te bereiken, onder één dak.
          </p>
        </motion.div>
      </div>

      <div>
        {services.map((service, index) => (
          <ServiceSection
            key={service.id}
            service={service}
            isAdminMode={isAdminMode}
            onEdit={handleEditClick}
            index={index}
          />
        ))}
      </div>

      {currentService && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="bg-gray-900 border-red-600 text-white">
            <DialogHeader>
              <DialogTitle>Dienst Bewerken: {currentService.title}</DialogTitle>
              <DialogDescription>
                Pas hier de details van de dienst aan.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="title" className="text-right">Titel</label>
                <Input id="title" name="title" value={currentService.title} onChange={handleInputChange} className="col-span-3 bg-gray-800 border-gray-700" />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <label htmlFor="description" className="text-right pt-2">Beschrijving</label>
                <textarea id="description" name="description" value={currentService.description} onChange={handleInputChange} rows={4} className="col-span-3 bg-gray-800 border-gray-700 w-full rounded-md p-2 text-sm" />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="image" className="text-right">Afbeelding prompt</label>
                <Input id="image" name="image" value={currentService.image} onChange={handleInputChange} className="col-span-3 bg-gray-800 border-gray-700" />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <label className="text-right pt-2">Features</label>
                <div className="col-span-3 space-y-2">
                  {currentService.features.map((feature, index) => (
                    <Input 
                      key={index}
                      value={feature}
                      onChange={(e) => {
                        const newFeatures = [...currentService.features];
                        newFeatures[index] = e.target.value;
                        setCurrentService(prev => ({ ...prev, features: newFeatures }));
                      }}
                      className="bg-gray-800 border-gray-700"
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Annuleren</Button>
              <Button onClick={handleSave} className="bg-red-600 hover:bg-red-700">
                <Save className="mr-2 h-4 w-4" /> Opslaan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ServicesPage;