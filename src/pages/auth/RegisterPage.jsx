
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
import { Mail, Lock, UserPlus, Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


const languageOptions = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'zu', name: 'isiZulu', flag: '🇿🇦' },
  { code: 'af', name: 'Afrikaans', flag: '🇿🇦' },
  { code: 'tn', name: 'Setswana', flag: '🇿🇦' },
];

const RegisterPage = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState(i18n.language);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError(t('passwordsDoNotMatch'));
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { error: signUpError } = await signUp({
        email,
        password,
        options: {
          data: {
            preferred_language: preferredLanguage,
          },
        },
      });
      if (signUpError) {
        throw signUpError;
      }
      toast({ title: t('registerSuccessTitle'), description: t('registerSuccessDesc') });
      i18n.changeLanguage(preferredLanguage);
      navigate('/verify-email'); 
    } catch (err) {
      setError(t(err.message) || t('registerErrorDefault'));
      toast({ variant: "destructive", title: t('registerErrorTitle'), description: t(err.message) || t('registerErrorDefault') });
    } finally {
      setLoading(false);
    }
  };
  
  const currentLanguageOption = languageOptions.find(lang => lang.code === preferredLanguage) || languageOptions[0];


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-payper-blue-default to-payper-green-default p-4">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-background p-8 rounded-2xl shadow-2xl"
      >
        <PayperLogo size="lg" className="mx-auto mb-8" />
        <h2 className="text-3xl font-bold text-center text-primary mb-2">{t('registerTitle')}</h2>
        <p className="text-center text-muted-foreground mb-8">{t('registerSubtitle')}</p>
        
        {error && <p className="bg-red-100 text-red-700 p-3 rounded-md text-sm mb-4">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">{t('emailAddress')}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input id="email" type="email" placeholder={t('emailPlaceholder')} value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t('password')}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input id="password" type="password" placeholder={t('passwordPlaceholder')} value={password} onChange={(e) => setPassword(e.target.value)} required className="pl-10" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input id="confirmPassword" type="password" placeholder={t('confirmPasswordPlaceholder')} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="pl-10" />
            </div>
          </div>
           <div className="space-y-2">
            <Label htmlFor="language">{t('preferredLanguage')}</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal h-12 text-base">
                  <Globe className="mr-2 h-5 w-5 text-muted-foreground" />
                  {currentLanguageOption.flag} {currentLanguageOption.name}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-full">
                {languageOptions.map((lang) => (
                  <DropdownMenuItem key={lang.code} onClick={() => setPreferredLanguage(lang.code)}>
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Button type="submit" className="w-full text-lg py-6 bg-payper-green-default hover:bg-payper-green-dark" disabled={loading}>
            <UserPlus className="mr-2 h-5 w-5" /> {loading ? t('registering') : t('registerButton')}
          </Button>
        </form>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          {t('alreadyHaveAccount')}{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            {t('loginLink')}
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
  