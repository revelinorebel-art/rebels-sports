import React from 'react';
import { Helmet } from 'react-helmet';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Services from '@/components/Services';
import Membership from '@/components/Membership';
import Contact from '@/components/Contact';

const HomePage = () => {
  return (
    <>
      <Helmet>
        <title>Rebels Sports - De 24/7 Healthclub</title>
        <meta name="description" content="Ontdek Rebels Sports, de exclusieve 24/7 health club waar luxe, persoonlijke aandacht en een hechte community samenkomen. Word vandaag nog lid." />
        <meta property="og:title" content="Rebels Sports - De 24/7 Healthclub" />
        <meta property="og:description" content="Ontdek Rebels Sports, de exclusieve 24/7 health club waar luxe, persoonlijke aandacht en een hechte community samenkomen. Word vandaag nog lid." />
      </Helmet>
      <Hero />
      <Features />
      <div className="bg-gray-950/50">
        <Services />
      </div>
      <Membership />
      <div className="bg-gray-950/50">
        <Contact />
      </div>
    </>
  );
};

export default HomePage;