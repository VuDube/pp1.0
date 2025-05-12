
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PayperLogo from '@/components/PayperLogo';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

const languageOptions = [
  { code: 'en', name: 'English' },
  { code: 'zu', name: 'isiZulu' },
  { code: 'af', name: 'Afrikaans' },
  { code: 'tn', name: 'Setswana' },
];

const AuthForm = ({ type, onSubmit, loading, error }) => {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState(i18n.language);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (type === 'signup' && password !== confirmPassword) {
      onSubmit(null, null, null, { message: t('error.passwordsDontMatch') });
      return;
    }
    onSubmit(email, password, type === 'signup' ? preferredLanguage : undefined);
  };

  const formTitle = type === 'login' ? t('auth.loginToYourAccount') : t('auth.createYourAccount');
  const submitButtonText = type === 'login' ? t('auth.login') : t('auth.signUp');
  const switchLinkText = type === 'login' ? t('auth.dontHaveAccount') : t('auth.alreadyHaveAccount');
  const switchLinkTo = type === 'login' ? '/signup' : '/login';

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
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">{formTitle}</h1>
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

          <div>
            <Label htmlFor="password">{t('auth.password')}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
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

          {type === 'signup' && (
            <>
              <div>
                <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
                <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
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
              <div>
                <Label htmlFor="language">{t('auth.preferredLanguage')}</Label>
                <Select value={preferredLanguage} onValueChange={setPreferredLanguage}>
                  <SelectTrigger id="language" className="mt-1">
                    <SelectValue placeholder={t('auth.selectLanguagePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {languageOptions.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          
          {type === 'login' && (
             <div className="text-right">
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                 {t('auth.forgotPasswordLink')}
                </Link>
            </div>
          )}

          <Button type="submit" className="w-full bg-payper-green-default hover:bg-payper-green-dark text-lg py-3" disabled={loading}>
            {loading ? t('auth.loading') : submitButtonText}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          {switchLinkText}{' '}
          <Link to={switchLinkTo} className="font-semibold text-primary hover:underline">
            {type === 'login' ? t('auth.signUpNow') : t('auth.loginNow')}
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default AuthForm;
  