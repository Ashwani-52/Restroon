import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const BackButton = ({ className = '' }) => {
  const navigate = useNavigate();
  return (
    <motion.button
      onClick={() => navigate('/')}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`absolute top-6 left-6 z-50 flex items-center justify-center p-3 rounded-full bg-white border-3 border-ink shadow-[4px_4px_0_#1A1A1A] hover:shadow-[2px_2px_0_#1A1A1A] hover:translate-y-1 transition-all text-xl ${className}`}
      title="Back to Home"
    >
      <span role="img" aria-label="back">⬅️</span>
    </motion.button>
  );
};
