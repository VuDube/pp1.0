
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PayperLogo from '@/components/PayperLogo';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/use-toast';
import { Mail, ArrowLeft } from 'lucide-react';

const ForgotPasswordPage = () => {
  const { sendPasswordResetEmail } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const { error: resetError } = await sendPasswordResetEmail(email);
      if (resetError) {
        throw resetError;
      }
      setMessage(t('passwordResetEmailSent'));
      toast({ title: t('successTitle'), description: t('passwordResetEmailSent') });
    } catch (err) {
      setError(t(err.message) || t('passwordResetErrorDefault'));
      toast({ variant: "destructive", title: t('errorTitle'), description: t(err.message) || t('passwordResetErrorDefault') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-payper-blue-default to-payper-green-default p-4">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-background p-8 rounded-2xl shadow-2xl"
      >
        <PayperLogo size="lg" className="mx-auto mb-8" />
        <h2 className="text-3xl font-bold text-center text-primary mb-2">{t('forgotPasswordTitle')}</h2>
        <p className="text-center text-muted-foreground mb-8">{t('forgotPasswordSubtitle')}</p>
        
        {error && <p className="bg-red-100 text-red-700 p-3 rounded-md text-sm mb-4">{error}</p>}
        {message && <p className="bg-green-100 text-green-700 p-3 rounded-md text-sm mb-4">{message}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">{t('emailAddress')}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder={t('emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10"
              />
            </div>
          </div>
          <Button type="submit" className="w-full text-lg py-6 bg-payper-blue-default hover:bg-payper-blue-dark" disabled={loading}>
            {loading ? t('sendingResetLink') : t('sendResetLinkButton')}
          </Button>
        </form>
        <p className="mt-8 text-center text-sm">
          <Link to="/login" className="font-semibold text-primary hover:underline flex items-center justify-center">
            <ArrowLeft className="mr-2 h-4 w-4" /> {t('backToLogin')}
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
  