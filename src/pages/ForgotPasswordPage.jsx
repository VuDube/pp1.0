
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PayperLogo from '@/components/PayperLogo';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';
import { AlertCircle } from 'lucide-react';

const ForgotPasswordPage = () => {
  const { sendPasswordResetEmail } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage('');
    try {
      const { error: resetError } = await sendPasswordResetEmail(email);
      if (resetError) {
        throw resetError;
      }
      setMessage(t('auth.passwordResetEmailSent'));
      toast({
        title: t('toast.success'),
        description: t('auth.passwordResetEmailSent'),
        variant: 'default',
      });
    } catch (err) {
      setError({ message: t(`supabaseErrors.${err.code || err.message}`, { default: err.message }) });
      toast({
        title: t('toast.error'),
        description: t(`supabaseErrors.${err.code || err.message}`, { default: err.message }),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-payper-blue-default to-payper-green-default p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-background p-6 sm:p-8 rounded-2xl shadow-2xl"
      >
        <div className="text-center mb-8">
          <PayperLogo className="mx-auto mb-4" />
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">{t('auth.forgotPasswordTitle')}</h1>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-destructive/10 border border-destructive text-destructive p-3 rounded-md mb-6 flex items-center"
          >
             <AlertCircle className="h-5 w-5 mr-2" />
            <p className="text-sm">{error.message}</p>
          </motion.div>
        )}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/10 border border-green-500 text-green-700 p-3 rounded-md mb-6"
          >
            <p className="text-sm">{message}</p>
          </motion.div>
        )}

        {!message && (
            <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
                placeholder="you@example.com"
              />
            </div>
            <Button type="submit" className="w-full bg-payper-green-default hover:bg-payper-green-dark text-lg py-3" disabled={loading}>
              {loading ? t('auth.loading') : t('auth.sendResetLink')}
            </Button>
          </form>
        )}

        <p className="mt-8 text-center text-sm text-muted-foreground">
          {t('auth.rememberPassword')}{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            {t('auth.loginNow')}
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
  