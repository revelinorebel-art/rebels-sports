import React from 'react';
import { Helmet } from 'react-helmet';
import Membership from '@/components/Membership';

const MembershipPage = () => {
  return (
    <div className="pt-20 bg-black">
      <Helmet>
        <title>Lidmaatschappen - Rebels Sports</title>
        <meta name="description" content="Kies het perfecte lidmaatschap dat bij jou past. Flexibele opties voor elk fitnessniveau en budget bij Rebels Sports." />
        <meta property="og:title" content="Lidmaatschappen - Rebels Sports" />
        <meta property="og:description" content="Kies het perfecte lidmaatschap dat bij jou past. Flexibele opties voor elk fitnessniveau en budget bij Rebels Sports." />
      </Helmet>
      <Membership />
    </div>
  );
};

export default MembershipPage;