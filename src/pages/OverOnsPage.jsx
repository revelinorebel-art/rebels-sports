import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Users, Target, Heart } from 'lucide-react';
const OverOnsPage = () => {
  return <div className="bg-black text-white pt-24 pb-20">
      <Helmet>
        <title>Over Ons - Rebels Sports</title>
        <meta name="description" content="Leer het verhaal en de missie van Rebels Sports kennen. Een community waar iedereen zich thuis voelt en aan zijn doelen werkt." />
        <meta property="og:title" content="Over Ons - Rebels Sports" />
        <meta property="og:description" content="Leer het verhaal en de missie van Rebels Sports kennen. Een community waar iedereen zich thuis voelt en aan zijn doelen werkt." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.8
      }} className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Het <span className="text-red-600">Verhaal</span> Achter Rebels Sports
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Meer dan een sportschool. Wij zijn een community, een familie, een beweging.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <motion.div initial={{
          opacity: 0,
          scale: 0.9
        }} whileInView={{
          opacity: 1,
          scale: 1
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.7
        }}>
            <img class="rounded-2xl shadow-2xl w-full h-auto object-cover" alt="Team van Rebels Sports trainers die samen lachen" src="https://horizons-cdn.hostinger.com/6efdc0d7-8cff-4f5a-8fdc-e45e276c0b36/4cfc0c34-f89d-48ce-b1ec-11025aaae942-InaH0.jpg" />
          </motion.div>
          <div>
            <motion.h2 className="text-3xl font-bold text-white mb-4" initial={{
            opacity: 0,
            x: -20
          }} whileInView={{
            opacity: 1,
            x: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.7,
            delay: 0.2
          }}>
              Onze Oprichting
            </motion.h2>
            <motion.p className="text-gray-300 mb-4" initial={{
            opacity: 0,
            x: -20
          }} whileInView={{
            opacity: 1,
            x: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.7,
            delay: 0.3
          }}>
              Rebels-Sports is meer dan een sportschool; het is een eerbetoon aan Kriel, de levenslustige vader van oprichtster Miranda. Zijn passie voor sport, gezelligheid en het samenbrengen van mensen vormt de kern van onze community.
            </motion.p>
            <motion.p className="text-gray-300" initial={{
            opacity: 0,
            x: -20
          }} whileInView={{
            opacity: 1,
            x: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.7,
            delay: 0.4
          }}>
              Miranda creëerde Rebels-Sports als een plek waar iedereen zich welkom voelt. Het gaat niet alleen om sterker worden, maar om de verbinding en steun die we bij elkaar vinden. Kriels energie is voelbaar in alles wat we doen. Hier sport je niet alleen, hier hoor je erbij. We lachen, praten en drinken samen koffie. Jij bent welkom om deel uit te maken van ons verhaal.
            </motion.p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <motion.div initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.5,
          delay: 0.1
        }} className="bg-white/5 p-8 rounded-xl border border-white/10">
                <div className="mb-4 inline-block p-4 bg-red-600/20 rounded-full">
                    <Target className="h-10 w-10 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Onze Missie</h3>
                <p className="text-gray-400">
                    Iedereen inspireren en uitrusten om de beste versie van zichzelf te worden, zowel fysiek als mentaal.
                </p>
            </motion.div>
             <motion.div initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.5,
          delay: 0.2
        }} className="bg-white/5 p-8 rounded-xl border border-white/10">
                <div className="mb-4 inline-block p-4 bg-red-600/20 rounded-full">
                    <Heart className="h-10 w-10 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Onze Waarden</h3>
                <p className="text-gray-400">
                    Passie, respect, community en resultaat. Deze vier pijlers vormen de kern van alles wat we doen.
                </p>
            </motion.div>
             <motion.div initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.5,
          delay: 0.3
        }} className="bg-white/5 p-8 rounded-xl border border-white/10">
                <div className="mb-4 inline-block p-4 bg-red-600/20 rounded-full">
                    <Users className="h-10 w-10 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Onze Community</h3>
                <p className="text-gray-400">
                    Een diverse en inclusieve familie van leden en trainers die elkaar ondersteunen en motiveren.
                </p>
            </motion.div>
        </div>
      </div>
    </div>;
};
export default OverOnsPage;