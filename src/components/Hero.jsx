import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';

const Hero = () => {
  const handleCTA = () => {
    toast({
      title: "🚧 Deze functie is nog niet geïmplementeerd",
      description: "Maar maak je geen zorgen! Je kunt het aanvragen in je volgende prompt! 🚀"
    });
  };

  return (
    <section id="home" className="relative h-screen flex items-center justify-center text-white overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        <img 
          src="https://horizons-cdn.hostinger.com/6efdc0d7-8cff-4f5a-8fdc-e45e276c0b36/4cfc0c34-f89d-48ce-b1ec-11025aaae942-lInAX.jpg" 
          alt="Luxe sportschool interieur met focus op een atleet die traint" 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, ease: "easeOut" }} 
          className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter mb-6"
        >
          REBELS <span className="text-red-600">SPORTS</span> COMMUNITY
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }} 
          className="text-lg md:text-xl text-gray-300 mb-10 max-w-xl"
        >
          De exclusieve health club waar luxe, persoonlijke aandacht en een hechte community samenkomen.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }} 
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button asChild size="lg" className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-4 text-lg">
            <Link to="/lidmaatschappen">
              Start Vandaag
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button onClick={handleCTA} variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg">
            Bekijk Lidmaatschappen
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;