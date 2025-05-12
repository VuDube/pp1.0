
import React, { useState } from 'react';
import AuthForm from '@/components/AuthForm';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

const SignupPage = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);

  const handleSignup = async (email, password, language, formError) => {
    if (formError) {
      setError(formError);
      return;
    }
    setLoading(true);
    setError(null);
    setShowVerificationMessage(false);
    try {
      const { error: signUpError, user } = await signUp(email, password, language);
      if (signUpError) {
        throw signUpError;
      }
      if (user && !user.email_confirmed_at) {
        setShowVerificationMessage(true);
        toast({
          title: t('toast.signupSuccessTitle'),
          description: t('toast.signupSuccessDescriptionCheckEmail'),
          variant: 'default',
          duration: 10000,
        });
      } else if (user) {
         toast({
            title: t('toast.signupSuccessTitle'),
            description: t('toast.signupSuccessDescription'),
            variant: 'default',
        });
        navigate('/');
      }
    } catch (err) {
      setError({ message: t(`supabaseErrors.${err.code || err.message}`, { default: err.message }) });
      toast({
        title: t('toast.signupErrorTitle'),
        description: t(`supabaseErrors.${err.code || err.message}`, { default: err.message }),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

   if (showVerificationMessage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-payper-blue-default to-payper-green-default p-6 text-center">
        <div className="bg-background p-8 sm:p-12 rounded-2xl shadow-2xl w-full max-w-md">
          <h1 className="text-2xl font-bold text-primary mb-4">{t('auth.checkYourEmail')}</h1>
          <p className="text-muted-foreground mb-6">{t('auth.verificationEmailSent')}</p>
          <Button onClick={() => navigate('/login')} className="w-full bg-payper-green-default hover:bg-payper-green-dark">
            {t('auth.backToLogin')}
          </Button>
        </div>
      </div>
    );
  }

  return <AuthForm type="signup" onSubmit={handleSignup} loading={loading} error={error} />;
};

export default SignupPage;
  