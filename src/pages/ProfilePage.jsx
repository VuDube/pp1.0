
import React, { useState } from 'react';
import { User, Settings, Bell, Shield, LogOut, Edit3, KeyRound, Languages as LanguagesIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useTranslation, Trans } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


const ProfileOption = ({ icon, label, onClick, isDestructive = false }) => (
  <motion.button
    className={`flex items-center w-full p-4 bg-card ${isDestructive ? 'hover:bg-destructive/10 text-destructive' : 'hover:bg-accent'} rounded-lg shadow transition-colors duration-150`}
    onClick={onClick}
    whileHover={{ x: 5 }}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
  >
    {React.cloneElement(icon, { className: `h-6 w-6 mr-4 ${isDestructive ? 'text-destructive' : 'text-primary'}` })}
    <span className={`text-lg ${isDestructive ? 'text-destructive' : 'text-foreground'}`}>{label}</span>
  </motion.button>
);

const languageOptions = [
  { code: 'en', name: 'English' },
  { code: 'zu', name: 'isiZulu' },
  { code: 'af', name: 'Afrikaans' },
  { code: 'tn', name: 'Setswana' },
];

const ProfilePage = () => {
  const { t, i18n } = useTranslation();
  const { user, signOut, updateUserLanguage, updateUserPassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isLanguageDialogOpen, setIsLanguageDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  const [loading, setLoading] = useState(false);


  const handleLogout = async () => {
    setLoading(true);
    const { error } = await signOut();
    if (error) {
      toast({
        title: t('toast.error'),
        description: t('auth.logoutError', { message: error.message }),
        variant: 'destructive',
      });
    } else {
      toast({
        title: t('toast.success'),
        description: t('auth.logoutSuccess'),
        variant: 'default',
      });
      navigate('/login');
    }
    setLoading(false);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      toast({ title: t('toast.error'), description: t('error.passwordsDontMatch'), variant: 'destructive' });
      return;
    }
    if (newPassword.length < 6) {
       toast({ title: t('toast.error'), description: t('error.passwordTooShort'), variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await updateUserPassword(newPassword);
    if (error) {
      toast({ title: t('toast.error'), description: t(`supabaseErrors.${error.code || error.message}`, { default: error.message }), variant: 'destructive' });
    } else {
      toast({ title: t('toast.success'), description: t('auth.passwordUpdatedSuccess'), variant: 'default' });
      setIsPasswordDialogOpen(false);
      setNewPassword('');
      setConfirmNewPassword('');
    }
    setLoading(false);
  };

  const handleChangeLanguage = async () => {
    setLoading(true);
    const { error } = await updateUserLanguage(selectedLanguage);
     if (error) {
      toast({ title: t('toast.error'), description: t(`supabaseErrors.${error.code || error.message}`, { default: error.message }), variant: 'destructive' });
    } else {
      toast({ title: t('toast.success'), description: t('auth.languageUpdatedSuccess'), variant: 'default' });
      setIsLanguageDialogOpen(false);
    }
    setLoading(false);
  };


  const profileOptions = [
    { icon: <User />, label: t('personalInformation'), onClick: () => {} /* Placeholder */ },
    { icon: <KeyRound />, label: t('auth.changePassword'), onClick: () => setIsPasswordDialogOpen(true) },
    { icon: <LanguagesIcon />, label: t('auth.changeLanguage'), onClick: () => setIsLanguageDialogOpen(true) },
    { icon: <Settings />, label: t('accountSettings'), onClick: () => {} /* Placeholder */ },
    { icon: <Bell />, label: t('notificationPreferences'), onClick: () => {} /* Placeholder */ },
    { icon: <Shield />, label: t('securityPrivacy'), onClick: () => {} /* Placeholder */ },
    { icon: <LogOut />, label: t('logOut'), onClick: handleLogout, isDestructive: true },
  ];
  
  const userEmail = user?.email || 'user@example.com';
  const avatarText = userEmail.substring(0, 2).toUpperCase();


  return (
    <div className="space-y-8 pb-20">
      <motion.div 
        className="relative flex flex-col items-center p-8 payper-gradient-bg rounded-xl shadow-xl text-center"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative mb-4">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl font-bold text-primary shadow-lg">
            {avatarText}
          </div>
          <Button variant="outline" size="icon" className="absolute bottom-0 right-0 bg-background rounded-full p-2 shadow-md border-primary hover:bg-primary/10">
            <Edit3 className="h-4 w-4 text-primary" />
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-white">{user?.user_metadata?.full_name || userEmail.split('@')[0]}</h1>
        <p className="text-md text-primary-foreground">{userEmail}</p>
      </motion.div>

      <motion.section
        className="space-y-4"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.05, delayChildren: 0.2 } }
        }}
      >
        {profileOptions.map((option, index) => (
          <ProfileOption key={index} {...option} />
        ))}
      </motion.section>

      <motion.div 
        className="mt-10 p-6 glassmorphism-card text-foreground"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <h3 className="text-xl font-semibold mb-3 text-center">{t('accountTier')}</h3>
        <p className="text-center text-sm mb-2">
          <Trans i18nKey="currentPlan">
            You are currently on the <span className="font-bold text-payper-green-default">Standard Plan</span>.
          </Trans>
        </p>
        <p className="text-center text-xs text-muted-foreground mb-4">{t('planDescription')}</p>
        <div className="text-center">
          <Button variant="secondary" className="bg-payper-green-default hover:bg-payper-green-dark">
            {t('upgradePlan')}
          </Button>
        </div>
      </motion.div>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-background">
          <DialogHeader>
            <DialogTitle>{t('auth.changePassword')}</DialogTitle>
            <DialogDescription>{t('auth.changePasswordDescription')}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-password"className="text-right col-span-1">{t('auth.newPassword')}</Label>
              <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="confirm-new-password"className="text-right col-span-1">{t('auth.confirmNewPassword')}</Label>
              <Input id="confirm-new-password" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>{t('cancel')}</Button>
            <Button type="submit" onClick={handleChangePassword} disabled={loading} className="bg-payper-green-default hover:bg-payper-green-dark">{loading ? t('auth.loading') : t('auth.updatePasswordButton')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Language Dialog */}
      <Dialog open={isLanguageDialogOpen} onOpenChange={setIsLanguageDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-background">
          <DialogHeader>
            <DialogTitle>{t('auth.changeLanguage')}</DialogTitle>
            <DialogDescription>{t('auth.changeLanguageDescription')}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="language-select" className="text-right col-span-1">{t('language')}</Label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger id="language-select" className="col-span-3">
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLanguageDialogOpen(false)}>{t('cancel')}</Button>
            <Button type="submit" onClick={handleChangeLanguage} disabled={loading} className="bg-payper-green-default hover:bg-payper-green-dark">{loading ? t('auth.loading') : t('saveChanges')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
  