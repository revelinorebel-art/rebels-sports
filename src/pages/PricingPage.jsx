import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Check, Clock, Users } from 'lucide-react';

const PricingPage = () => {
  const strippenkaarten = [
    {
      id: 1,
      title: "Yoga & Pilates",
      price: "€125",
      lessons: "10 lessen",
      validity: "3 maanden geldig",
      description: "Perfect voor ontspanning, flexibiliteit en core versterking",
      features: [
        "Yin Yoga sessies",
        "Pilates lessen",
        "Bal Pilates",
        "Kleine groepen",
        "Persoonlijke begeleiding"
      ],
      color: "from-red-500 to-red-600",
      icon: <Users className="w-8 h-8" />
    },
    {
      id: 2,
      title: "Zumba & Overige Groepslessen",
      price: "€75",
      lessons: "10 lessen",
      validity: "3 maanden geldig",
      description: "Energieke groepslessen voor conditie en plezier",
      features: [
        "Zumba lessen",
        "Latin Line",
        "Freestyle training",
        "Grote groepen",
        "Hoge energie sessies"
      ],
      color: "from-red-600 to-red-700",
      icon: <Clock className="w-8 h-8" />
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="pt-20 bg-black min-h-screen">
      <Helmet>
        <title>Prijzen - Rebels Sports</title>
        <meta name="description" content="Ontdek onze strippenkaarten voor Yoga & Pilates en Zumba & overige groepslessen. Flexibele prijzen voor elk fitnessniveau." />
        <meta property="og:title" content="Prijzen - Rebels Sports" />
        <meta property="og:description" content="Ontdek onze strippenkaarten voor Yoga & Pilates en Zumba & overige groepslessen. Flexibele prijzen voor elk fitnessniveau." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 to-black"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Onze <span className="text-red-500">Prijzen</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-4">
              Kies de strippenkaart die bij jou past. Flexibele opties voor elke discipline en elk budget.
            </p>
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 max-w-2xl mx-auto mb-8">
              <p className="text-white font-medium text-center">
                ℹ️ Strippenkaarten zijn alleen verkrijgbaar aan de balie bij Rebels Sports
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 gap-8 lg:gap-12 items-stretch"
          >
            {strippenkaarten.map((kaart) => (
              <motion.div
                key={kaart.id}
                variants={cardVariants}
                className="relative group h-full"
              >
                <div className="relative bg-gray-900/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-800 hover:border-red-500/70 hover:shadow-xl hover:shadow-red-500/20 transition-all duration-300 overflow-hidden h-full flex flex-col">
                  {/* Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-red-600/5 group-hover:from-red-500/15 group-hover:to-red-600/15 transition-all duration-300"></div>
                  
                  {/* Content */}
                  <div className="relative z-10 flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${kaart.color} text-white`}>
                        {kaart.icon}
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-white">{kaart.price}</div>
                        <div className="text-gray-400 text-sm">{kaart.lessons}</div>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-2xl font-bold text-white mb-3">{kaart.title}</h3>
                    <p className="text-gray-300 mb-6">{kaart.description}</p>

                    {/* Validity */}
                    <div className="flex items-center mb-6 p-3 bg-gray-800/50 rounded-lg">
                      <Clock className="w-5 h-5 text-red-500 mr-2" />
                      <span className="text-white font-medium">{kaart.validity}</span>
                    </div>

                    {/* Features */}
                    <div className="space-y-3 mb-8 flex-grow">
                      {kaart.features.map((feature, index) => (
                        <div key={index} className="flex items-center">
                          <Check className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-300">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full py-4 px-6 bg-gradient-to-r ${kaart.color} text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-red-500/30 hover:from-red-600 hover:to-red-700 transition-all duration-300`}
                    >
                      Koop aan de Balie
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Additional Info */}
      <section className="py-16 bg-gray-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h2 className="text-3xl font-bold text-white mb-6">Hoe Koop Je Een Strippenkaart?</h2>
            <div className="bg-gray-800/50 rounded-xl p-6 mb-12">
              <p className="text-lg text-gray-300 mb-4">
                Kom langs bij onze balie in Rebels Sports om je strippenkaart aan te schaffen. 
                Ons team helpt je graag bij het kiezen van de juiste optie.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="text-center">
                  <p className="text-white font-semibold">📍 Adres</p>
                  <p className="text-gray-300">Rebels Sports</p>
                </div>
                <div className="text-center">
                  <p className="text-white font-semibold">🕒 Openingstijden</p>
                  <p className="text-gray-300">Zie onze contactpagina</p>
                </div>
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-6">Waarom Strippenkaarten?</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Flexibiliteit</h3>
                <p className="text-gray-300">Plan je lessen wanneer het jou uitkomt binnen de geldigheidsduur.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Voordelig</h3>
                <p className="text-gray-300">Bespaar geld met onze strippenkaarten vergeleken met losse lessen.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Geen Verplichtingen</h3>
                <p className="text-gray-300">Geen maandelijkse abonnementen, betaal alleen voor wat je gebruikt.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;