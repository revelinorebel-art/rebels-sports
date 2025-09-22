import React from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Users, Trophy, HeartPulse } from 'lucide-react';

const featuresList = [
  {
    icon: Dumbbell,
    title: "1500 m2 Sportruimte",
    description: "State-of-the-art fitness apparatuur in een ruime, inspirerende omgeving."
  },
  {
    icon: Users,
    title: "14 Live Groepslessen",
    description: "Dagelijks een breed scala aan energieke lessen voor elk niveau."
  },
  {
    icon: Trophy,
    title: "Expert Trainers",
    description: "Gecertificeerde personal trainers die je helpen je doelen te bereiken."
  },
  {
    icon: HeartPulse,
    title: "100 m2 Wellness",
    description: "Ontspan en herstel in onze luxe sauna en wellness faciliteiten."
  }
];

const Features = () => {
  return (
    <section id="features" className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuresList.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center p-6"
            >
              <div className="flex justify-center items-center mb-4">
                <div className="p-4 bg-white/5 rounded-full border border-white/10">
                  <feature.icon className="h-10 w-10 text-red-500" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;