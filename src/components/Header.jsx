import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleCTA = () => {
    toast({
      title: "🚧 Deze functie is nog niet geïmplementeerd",
      description: "Maar maak je geen zorgen! Je kunt het aanvragen in je volgende prompt! 🚀",
    });
  };

  const navLinks = [
    { to: "/", text: "Home" },
    { to: "/diensten", text: "Diensten" },
    { to: "/groepslessen", text: "Groepslessen" },
    { to: "/lidmaatschappen", text: "Lidmaatschappen" },
    { to: "/over-ons", text: "Over Ons" },
    { to: "/contact", text: "Contact" },
  ];

  const NavItem = ({ to, text, onClick }) => (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `font-medium transition-colors duration-300 ${
          isActive
            ? 'text-red-600'
            : 'text-white hover:text-red-500'
        }`
      }
    >
      {text}
    </NavLink>
  );

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-lg border-b border-white/10">
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="flex items-center justify-between h-20">
          <NavLink to="/" className="flex-shrink-0">
            <img 
              src="https://horizons-cdn.hostinger.com/6efdc0d7-8cff-4f5a-8fdc-e45e276c0b36/c381a0cb97bda6e3306e4b1948761411.png" 
              alt="Rebels Sports Logo" 
              className="h-12" 
            />
          </NavLink>

          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <NavItem key={link.to} to={link.to} text={link.text} />
            ))}
          </nav>

          <div className="hidden md:flex items-center">
            <Button onClick={handleCTA} className="ml-8 bg-red-600 hover:bg-red-700 text-white font-semibold">
              Word Lid
            </Button>
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-black/90 pb-4"
        >
          <nav className="flex flex-col items-center space-y-4 pt-2">
            {navLinks.map((link) => (
              <NavItem key={link.to} to={link.to} text={link.text} onClick={() => setIsOpen(false)} />
            ))}
            <Button onClick={handleCTA} className="w-4/5 bg-red-600 hover:bg-red-700 text-white font-semibold">
              Word Lid
            </Button>
          </nav>
        </motion.div>
      )}
    </header>
  );
};

export default Header;