import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

import HomePage from '@/pages/HomePage';
import ServicesPage from '@/pages/ServicesPage';
import MembershipPage from '@/pages/MembershipPage';
import ContactPage from '@/pages/ContactPage';
import GroepslessenPage from '@/pages/GroepslessenPage';
import OverOnsPage from '@/pages/OverOnsPage';
import AdminPage from '@/pages/AdminPage';
import ScrollToTop from '@/components/ScrollToTop';

function App() {
  const [isAdminMode, setIsAdminMode] = useState(false);

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-black">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage isAdminMode={isAdminMode} />} />
            <Route path="/diensten" element={<ServicesPage isAdminMode={isAdminMode} />} />
            <Route path="/groepslessen" element={<GroepslessenPage isAdminMode={isAdminMode} />} />
            <Route path="/lidmaatschappen" element={<MembershipPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/over-ons" element={<OverOnsPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>
        <Footer />
        <Toaster />
      </div>
    </Router>
  );
}

export default App;