
import React, { useState } from 'react';
import AuthForm from '@/components/AuthForm';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

const LoginPage = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        throw signInError;
      }
      toast({
        title: t('toast.loginSuccessTitle'),
        description: t('toast.loginSuccessDescription'),
        variant: 'default',
      });
      navigate('/');
    } catch (err) {
      setError({ message: t(`supabaseErrors.${err.code || err.message}`, { default: err.message }) });
      toast({
        title: t('toast.loginErrorTitle'),
        description: t(`supabaseErrors.${err.code || err.message}`, { default: err.message }),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return <AuthForm type="login" onSubmit={handleLogin} loading={loading} error={error} />;
};

export default LoginPage;
  