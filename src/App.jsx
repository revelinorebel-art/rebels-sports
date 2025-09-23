import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { clearAllLocalStorage, checkLocalStorageData } from '@/utils/clearLocalStorage';

import HomePage from '@/pages/HomePage';
import ServicesPage from '@/pages/ServicesPage';
import PricingPage from '@/pages/PricingPage';
import ContactPage from '@/pages/ContactPage';
import GroepslessenPage from '@/pages/GroepslessenPage';
import OverOnsPage from '@/pages/OverOnsPage';
import TrainersPage from '@/pages/TrainersPage';
import AdminPage from '@/pages/AdminPage';
import ScrollToTop from '@/components/ScrollToTop';

function App() {
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Make localStorage clearing functions available in development
  useEffect(() => {
    if (import.meta.env.DEV) {
      window.clearRebelsLocalStorage = clearAllLocalStorage;
      window.checkRebelsLocalStorage = checkLocalStorageData;
      console.log('🔧 Development mode: localStorage utilities available');
      console.log('📝 Use clearRebelsLocalStorage() to clear all localStorage data');
      console.log('📊 Use checkRebelsLocalStorage() to check current localStorage data');
    }
  }, []);

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
            <Route path="/prijzen" element={<PricingPage />} />
            <Route path="/trainers" element={<TrainersPage />} />
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