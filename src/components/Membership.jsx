import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';

const Membership = () => {
  const handleInfoClick = () => {
    toast({
      title: "🚧 Meer informatie",
      description: "Deze functie is nog niet geïmplementeerd, maar je kunt hem aanvragen! 🚀",
    });
  };

  const plans = [
    {
      name: "Brons",
      duration: "12 weken",
      price: "10,99",
      features: ["10% Korting", "Jongeren (12-18)", "Studenten", "65-Plus"],
      popular: false,
      order: 'md:order-1'
    },
    {
      name: "Goud",
      duration: "52 weken",
      price: "8,99",
      features: ["10% Korting", "Jongeren (12-18)", "Studenten", "65-Plus"],
      popular: true,
      order: 'md:order-2'
    },
    {
      name: "Zilver",
      duration: "26 weken",
      price: "9,99",
      features: ["10% Korting", "Jongeren (12-18)", "Studenten", "65-Plus"],
      popular: false,
      order: 'md:order-3'
    }
  ];

  const allAccessFeatures = [
    "Onbeperkt Fitness", "Onbeperkt Groepslessen", "Gebruik van de Sauna", "Trainingsschema's", "InBody metingen", "Rebels Sports App", "Gratis koffie & thee", "7 dagen per week open"
  ];

  return (
    <section id="membership" className="py-20 bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-wider mb-4">
            Ontdek Onze <span className="text-red-600">Tarieven</span>
          </h2>
          <p className="text-lg text-gray-400">
            Altijd met de laagste prijs garantie!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative rounded-lg p-8 flex flex-col h-full ${plan.order} ${
                plan.popular 
                  ? 'bg-gradient-to-br from-red-700 to-red-900 shadow-2xl shadow-red-500/20 scale-105' 
                  : 'bg-gray-900 border border-gray-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider">
                    Meest Gekozen
                  </span>
                </div>
              )}
              
              <div className="flex-grow">
                <h3 className="text-3xl font-bold text-center mb-2">{plan.name}</h3>
                <p className="text-center text-gray-300 mb-4">{plan.duration}</p>
                <p className="text-center text-xs text-gray-400 mb-1">*Daarna per 4 weken opzegbaar</p>
                <p className="text-center text-xs text-gray-400 mb-6">Gemiddeld inschrijfgeld: € 29,95</p>

                <div className="text-center my-8">
                  <p className="text-gray-300 uppercase text-sm">Wekelijks</p>
                  <p className="text-5xl font-bold my-1">
                    €{plan.price}
                  </p>
                </div>

                <ul className="space-y-3 text-center">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="text-gray-300">{feature}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <Button 
                  onClick={handleInfoClick}
                  className={`w-full font-bold uppercase tracking-wider ${
                    plan.popular 
                      ? 'bg-white text-black hover:bg-gray-200' 
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  Meer Informatie
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-20 text-center"
        >
          <h3 className="text-2xl font-bold mb-6">Inbegrepen bij alle abonnementen:</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {allAccessFeatures.map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-300">
                <Check className="h-5 w-5 text-red-500 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
          <Button asChild size="lg" className="mt-12 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider">
            <Link to="/contact">Schrijf je nu in!</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default Membership;