
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PayperLogo from '@/components/PayperLogo';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/use-toast';
import { Mail, Lock } from 'lucide-react';

const LoginPage = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: signInError } = await signIn({ email, password });
      if (signInError) {
        throw signInError;
      }
      toast({ title: t('loginSuccessTitle'), description: t('loginSuccessDesc') });
      navigate('/');
    } catch (err) {
      setError(t(err.message) || t('loginErrorDefault'));
      toast({ variant: "destructive", title: t('loginErrorTitle'), description: t(err.message) || t('loginErrorDefault') });
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
        <h2 className="text-3xl font-bold text-center text-primary mb-2">{t('loginTitle')}</h2>
        <p className="text-center text-muted-foreground mb-8">{t('loginSubtitle')}</p>
        
        {error && <p className="bg-red-100 text-red-700 p-3 rounded-md text-sm mb-4">{error}</p>}
        
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
          <div className="space-y-2">
            <Label htmlFor="password">{t('password')}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10"
              />
            </div>
          </div>
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-primary hover:underline">
              {t('forgotPasswordLink')}
            </Link>
          </div>
          <Button type="submit" className="w-full text-lg py-6 bg-payper-blue-default hover:bg-payper-blue-dark" disabled={loading}>
            {loading ? t('loggingIn') : t('loginButton')}
          </Button>
        </form>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          {t('dontHaveAccount')}{' '}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            {t('registerLink')}
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
  