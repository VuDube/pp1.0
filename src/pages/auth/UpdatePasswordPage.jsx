
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PayperLogo from '@/components/PayperLogo';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/use-toast';
import { Lock, CheckCircle } from 'lucide-react';

const UpdatePasswordPage = () => {
  const { updateUser, session } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!session) {
      navigate('/login');
      toast({ variant: "destructive", title: t('errorTitle'), description: t('sessionExpiredForPasswordUpdate') });
    }
  }, [session, navigate, t, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError(t('passwordsDoNotMatch'));
      return;
    }
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const { error: updateError } = await updateUser({ password });
      if (updateError) {
        throw updateError;
      }
      setMessage(t('passwordUpdateSuccess'));
      toast({ title: t('successTitle'), description: t('passwordUpdateSuccess') });
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(t(err.message) || t('passwordUpdateErrorDefault'));
      toast({ variant: "destructive", title: t('errorTitle'), description: t(err.message) || t('passwordUpdateErrorDefault') });
    } finally {
      setLoading(false);
    }
  };

  if (message) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-payper-blue-default to-payper-green-default p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-background p-8 rounded-2xl shadow-2xl text-center"
        >
          <CheckCircle className="h-16 w-16 text-payper-green-default mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-primary mb-4">{t('passwordUpdatedTitle')}</h2>
          <p className="text-muted-foreground mb-6">{message}</p>
          <Button onClick={() => navigate('/')} className="w-full bg-payper-green-default hover:bg-payper-green-dark">{t('goToDashboard')}</Button>
        </motion.div>
      </div>
    );
  }


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-payper-blue-default to-payper-green-default p-4">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-background p-8 rounded-2xl shadow-2xl"
      >
        <PayperLogo size="lg" className="mx-auto mb-8" />
        <h2 className="text-3xl font-bold text-center text-primary mb-2">{t('updatePasswordTitle')}</h2>
        <p className="text-center text-muted-foreground mb-8">{t('updatePasswordSubtitle')}</p>
        
        {error && <p className="bg-red-100 text-red-700 p-3 rounded-md text-sm mb-4">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password">{t('newPassword')}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder={t('newPasswordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('confirmNewPassword')}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder={t('confirmNewPasswordPlaceholder')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="pl-10"
              />
            </div>
          </div>
          <Button type="submit" className="w-full text-lg py-6 bg-payper-blue-default hover:bg-payper-blue-dark" disabled={loading}>
            {loading ? t('updatingPassword') : t('updatePasswordButton')}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default UpdatePasswordPage;
  