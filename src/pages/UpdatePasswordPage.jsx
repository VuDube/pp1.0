
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PayperLogo from '@/components/PayperLogo';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

const UpdatePasswordPage = () => {
  const { updateUserPassword, session } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  // Check if the user is recovering their password or updating it while logged in
  const isRecoveryFlow = location.hash.includes('type=recovery');

  useEffect(() => {
    // If this is not a recovery flow (i.e., user is updating password while logged in)
    // and there is no session, redirect to login.
    if (!isRecoveryFlow && !session) {
      toast({
        title: t('toast.error'),
        description: t('auth.mustBeLoggedInToUpdatePassword'),
        variant: 'destructive',
      });
      navigate('/login');
    }
  }, [session, navigate, toast, t, isRecoveryFlow]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError({ message: t('error.passwordsDontMatch') });
      return;
    }
    setLoading(true);
    setError(null);
    setMessage('');
    try {
      const { error: updateError } = await updateUserPassword(password);
      if (updateError) {
        throw updateError;
      }
      setMessage(t('auth.passwordUpdatedSuccess'));
      toast({
        title: t('toast.success'),
        description: t('auth.passwordUpdatedSuccess'),
        variant: 'default',
      });
      setTimeout(() => navigate(isRecoveryFlow ? '/login' : '/profile'), 2000);
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
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">{t('auth.updatePasswordTitle')}</h1>
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="password">{t('auth.newPassword')}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
                placeholder="••••••••"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="confirmPassword">{t('auth.confirmNewPassword')}</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-1"
                placeholder="••••••••"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          <Button type="submit" className="w-full bg-payper-green-default hover:bg-payper-green-dark text-lg py-3" disabled={loading}>
            {loading ? t('auth.loading') : t('auth.updatePasswordButton')}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default UpdatePasswordPage;
  