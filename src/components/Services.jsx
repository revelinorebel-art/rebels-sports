import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const servicesList = [
  {
    title: "Personal Training",
    description: "One-on-one begeleiding voor maximale resultaten en motivatie.",
    image: "Personal trainer die iemand begeleidt met gewichtheffen",
    link: "/diensten#personal-training"
  },
  {
    title: "Groepslessen",
    description: "Energieke groepslessen zoals HIIT, Yoga, Spinning en Zumba.",
    image: "Groep mensen in een fitness les aan het sporten",
    link: "/groepslessen"
  },
  {
    title: "Voedingsadvies",
    description: "Professioneel voedingsadvies afgestemd op jouw doelen.",
    image: "Gezonde voeding en supplementen op een tafel",
    link: "/diensten#voedingsadvies"
  },
  {
    title: "Wellness",
    description: "Ontspan en herstel in onze luxe sauna en wellness faciliteiten.",
    image: "Serene wellness ruimte met sauna",
    link: "/diensten#wellness"
  }
];

const Services = () => {
  return (
    <section id="services" className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Onze <span className="text-red-600">Diensten</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Alles wat je nodig hebt om je doelen te bereiken, onder één dak.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {servicesList.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-lg"
            >
              <Link to={service.link} className="block">
                <img  class="w-full h-96 object-cover transform group-hover:scale-110 transition-transform duration-500 ease-in-out" alt={service.image} src="https://images.unsplash.com/photo-1595872018818-97555653a011" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{service.title}</h3>
                  <p className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300">{service.description}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Button asChild size="lg" className="bg-red-600 hover:bg-red-700 text-white font-semibold">
            <Link to="/diensten">Bekijk alle diensten</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default Services;