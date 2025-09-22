import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const Popup = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleActionClick = () => {
    setIsOpen(false);
    toast({
      title: "🚀 Actie geclaimd!",
      description: "Welkom! Je kunt nu gratis sporten tot eind september.",
    });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9998]"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative bg-white text-black rounded-xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-black transition-colors"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Rebels Sports</h2>
            <p className="text-gray-600 mb-6">
              Ontdek ons nu – helemaal gratis tot eind september!
            </p>
            <Button
              onClick={handleActionClick}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              Start Nu
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Popup;