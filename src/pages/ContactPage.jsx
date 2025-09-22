import React from 'react';
import { Helmet } from 'react-helmet';
import Contact from '@/components/Contact';

const ContactPage = () => {
  return (
    <div className="pt-20">
      <Helmet>
        <title>Contact - Rebels Sports</title>
        <meta name="description" content="Neem contact op met Rebels Sports. Vind ons adres, openingstijden of stuur ons een bericht. We helpen je graag verder!" />
        <meta property="og:title" content="Contact - Rebels Sports" />
        <meta property="og:description" content="Neem contact op met Rebels Sports. Vind ons adres, openingstijden of stuur ons een bericht. We helpen je graag verder!" />
      </Helmet>
      <Contact />
    </div>
  );
};

export default ContactPage;