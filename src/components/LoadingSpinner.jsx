
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const LoadingSpinner = ({ size = 'default', text }) => {
  const { t } = useTranslation();
  
  const spinnerSizes = {
    sm: 'h-4 w-4',
    default: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <motion.div
        className={`rounded-full border-2 border-primary border-t-transparent ${spinnerSizes[size]}`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">
          {text || t('loading')}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
