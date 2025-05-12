
import React from 'react';
import { Link } from 'react-router-dom';
import PayperLogo from '@/components/PayperLogo';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';


const VerifyEmailPage = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-payper-blue-default to-payper-green-default p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-background p-8 sm:p-12 rounded-2xl shadow-2xl text-center"
      >
        <PayperLogo size="lg" className="mx-auto mb-8" />
        <MailCheck className="h-20 w-20 text-payper-green-default mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-primary mb-4">{t('verifyEmailTitle')}</h1>
        <p className="text-muted-foreground mb-8 text-lg">
          {t('verifyEmailMessage')}
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          {t('verifyEmailSpam')}
        </p>
        <Link to="/login">
          <Button className="w-full text-lg py-6 bg-payper-blue-default hover:bg-payper-blue-dark">
            {t('backToLogin')}
          </Button>
        </Link>
         <p className="mt-6 text-xs text-muted-foreground">
          {t('didNotReceiveEmail')}{' '}
          <button onClick={() => alert(t('resendNotImplemented'))} className="font-semibold text-primary hover:underline">
            {t('resendVerificationLink')}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;
  