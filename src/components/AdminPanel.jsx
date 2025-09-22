import React from 'react';
import { ShieldCheck, ShieldOff, Settings } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';

const AdminPanel = ({ isAdminMode, setIsAdminMode }) => {
  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed bottom-5 right-5 bg-white/10 backdrop-blur-lg p-4 rounded-lg shadow-2xl border border-white/20 z-50"
    >
      <div className="flex items-center gap-4">
        <Settings className="text-white h-6 w-6" />
        <Label htmlFor="admin-mode" className="flex items-center gap-2 text-white font-semibold cursor-pointer">
          {isAdminMode ? <ShieldCheck className="text-green-400" /> : <ShieldOff className="text-gray-400" />}
          Beheerdersmodus
        </Label>
        <Switch id="admin-mode" checked={isAdminMode} onCheckedChange={setIsAdminMode} />
      </div>
    </motion.div>
  );
};

export default AdminPanel;