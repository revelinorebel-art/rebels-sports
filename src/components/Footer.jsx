import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const quickLinks = [
    { text: 'Over Ons', path: '/over-ons' },
    { text: 'Lidmaatschappen', path: '/lidmaatschappen' },
    { text: 'Contact Us', path: '/contact' },
  ];

  return (
    <footer className="bg-black border-t border-white/10 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="block mb-4">
              <img 
                src="https://horizons-cdn.hostinger.com/6efdc0d7-8cff-4f5a-8fdc-e45e276c0b36/c381a0cb97bda6e3306e4b1948761411.png" 
                alt="Rebels Sports Logo" 
                className="h-16" 
              />
            </Link>
            <p className="text-gray-400">
              Jouw partner in fitness en gezondheid. Samen bereiken we jouw doelen.
            </p>
          </div>

          <div>
            <span className="text-lg font-semibold text-white mb-4 block">Snelle Links</span>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.text}>
                  <Link 
                    to={link.path}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className="text-lg font-semibold text-white mb-4 block">Openingstijden</span>
            <div className="space-y-2 text-gray-400">
              <p>Maandag t/m vrijdag:</p>
              <p className="ml-2">09:30 - 21:30</p>
              <p>Zaterdag en zondag:</p>
              <p className="ml-2">10:00 - 17:00</p>
            </div>
          </div>

          <div>
            <span className="text-lg font-semibold text-white mb-4 block">Contact Info</span>
            <div className="space-y-2 text-gray-400">
              <p>Adres: Zuiveringsweg 74</p>
              <p>Postcode 8243 PE</p>
              <p>Stad: Lelystad</p>
              <p>Tel: 0320-417472</p>
              <p>info@rebelssports.nl</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} Rebels Sports. Alle rechten voorbehouden.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;