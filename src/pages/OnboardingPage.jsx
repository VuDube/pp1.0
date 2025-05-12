
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import PayperLogo from '@/components/PayperLogo';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

const languageOptions = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'zu', name: 'isiZulu', flag: '🇿🇦' },
  { code: 'af', name: 'Afrikaans', flag: '🇿🇦' },
  { code: 'tn', name: 'Setswana', flag: '🇿🇦' },
];

const OnboardingPage = ({ onLanguageSelected }) => {
  const { i18n, t } = useTranslation();

  const selectLanguage = (lng) => {
    i18n.changeLanguage(lng);
    onLanguageSelected();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-payper-blue-default to-payper-green-default p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-background p-8 sm:p-12 rounded-2xl shadow-2xl w-full max-w-md text-center"
      >
        <PayperLogo size="lg" className="mx-auto mb-8" />
        <h1 className="text-3xl font-bold text-primary mb-4">{t('welcomeTo')}</h1>
        <p className="text-muted-foreground mb-8 text-lg">{t('selectLanguage')}</p>
        
        <div className="space-y-4 mb-10">
          {languageOptions.map((lang) => (
            <motion.div
              key={lang.code}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => selectLanguage(lang.code)}
                variant="outline"
                className="w-full text-left py-6 text-lg border-2 hover:border-primary hover:bg-primary/10 transition-all duration-200"
              >
                <span className="mr-3 text-2xl">{lang.flag}</span>
                {lang.name}
                {i18n.language === lang.code && <CheckCircle className="ml-auto h-6 w-6 text-payper-green-default" />}
              </Button>
            </motion.div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {t('appName')} - {t('tagline')}
        </p>
      </motion.div>
    </div>
  );
};

export default OnboardingPage;
  