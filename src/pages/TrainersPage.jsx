import React from 'react';
import { motion } from 'framer-motion';
import { Star, Award, Heart, Zap } from 'lucide-react';

const TrainersPage = () => {
  const trainers = [
    {
      id: 1,
      name: "Miranda",
      specialization: "Freestyle",
      description: "Onze energieke Freestyle trainer die je helpt om je creativiteit en kracht te ontdekken door dynamische bewegingen en vrije expressie.",
      image: "/trainers/Miranda.jpg",
      icon: <Zap className="w-6 h-6" />,
      color: "from-purple-500 to-pink-500"
    },
    {
      id: 2,
      name: "Viviane",
      specialization: "Yin Yoga & Pilates",
      description: "Specialist in Yin Yoga en Pilates, begeleidt je naar innerlijke rust en flexibiliteit door zachte, meditatieve bewegingen en bewuste ademhaling.",
      image: "/trainers/Viviane.jpg",
      icon: <Heart className="w-6 h-6" />,
      color: "from-green-500 to-teal-500"
    },
    {
      id: 3,
      name: "Sherrine",
      specialization: "Zumba",
      description: "Onze enthousiaste Zumba instructeur die je meeneemt in een wervelwind van Latijnse ritmes en energieke dansbewegingen.",
      image: "/api/placeholder/300/400",
      icon: <Star className="w-6 h-6" />,
      color: "from-orange-500 to-red-500"
    },
    {
      id: 4,
      name: "Sandra",
      specialization: "Latin Line",
      description: "Expert in Latin Line dans, combineert passie voor Latijnse muziek met gestructureerde choreografieën voor een geweldige workout.",
      image: "/trainers/SANDRA.jpg",
      icon: <Star className="w-6 h-6" />,
      color: "from-yellow-500 to-orange-500"
    },
    {
      id: 5,
      name: "Bo",
      specialization: "Bal Pilates",
      description: "Gespecialiseerd in Bal Pilates, gebruikt innovatieve technieken met de fitnessbal voor core versterking en balans verbetering.",
      image: "/trainers/BO.jpg",
      icon: <Award className="w-6 h-6" />,
      color: "from-blue-500 to-purple-500"
    },
    {
      id: 6,
      name: "Marcel Tomasowa",
      specialization: "Blessure Specialist",
      description: "Onze expert in blessurepreventie en herstel. Marcel begeleidt je professioneel bij het voorkomen van blessures en het veilig herstellen van verwondingen.",
      image: "/trainers/Marcel Tomasoha.jpg",
      icon: <Award className="w-6 h-6" />,
      color: "from-indigo-500 to-blue-500"
    },
    {
      id: 7,
      name: "Reggie",
      specialization: "Inner Reset",
      description: "Begeleidt je met energetische sessies voor ontspanning, balans en herstel van lichaam en geest. Specialist in holistische wellness en mindfulness.",
      image: "/trainers/REGGIE.jpg",
      icon: <Heart className="w-6 h-6" />,
      color: "from-teal-500 to-green-500"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Onze Trainers
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Ontmoet ons team van professionele trainers die je begeleiden naar jouw fitnessdoelen
            </p>
          </motion.div>
        </div>
      </section>

      {/* Trainers Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {trainers.map((trainer) => (
              <motion.div
                key={trainer.id}
                variants={cardVariants}
                whileHover={{ 
                  y: -10,
                  transition: { duration: 0.3 }
                }}
                className="group relative"
              >
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform">
                  {/* Image Container */}
                  <div className="relative h-80 overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-t ${trainer.color} opacity-20 group-hover:opacity-30 transition-opacity duration-300`}></div>
                    <img
                      src={trainer.image}
                      alt={trainer.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    
                    {/* Floating Icon */}
                    <div className={`absolute top-4 right-4 p-3 rounded-full bg-gradient-to-r ${trainer.color} text-white shadow-lg`}>
                      {trainer.icon}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-gray-900 transition-colors">
                      {trainer.name}
                    </h3>
                    
                    <div className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${trainer.color} text-white text-sm font-semibold mb-4 shadow-md`}>
                      {trainer.specialization}
                    </div>
                    
                    <p className="text-gray-600 leading-relaxed text-sm">
                      {trainer.description}
                    </p>
                  </div>

                  {/* Hover Effect Border */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${trainer.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none`}></div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-gray-800 to-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Klaar om te beginnen?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Boek een les met een van onze professionele trainers en ontdek wat Rebels Sports voor jou kan betekenen.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 px-8 rounded-full text-lg shadow-lg transition-all duration-300"
            >
              Boek Nu Een Les
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default TrainersPage;