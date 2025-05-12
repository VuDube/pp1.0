
import React from 'react';
import PayperLogo from '@/components/PayperLogo';
import LanguageSelector from '@/components/LanguageSelector';
import { UserCircle, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/use-toast';


const Header = () => {
  const { session, signOut, user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();


  const handleLogout = async () => {
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
  };


  return (
    <motion.header 
      className="bg-background shadow-md sticky top-0 z-50"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
    >
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to={session ? "/" : "/login"}>
          <PayperLogo size="md" />
        </Link>
        <div className="flex items-center space-x-3">
          {user && <LanguageSelector />}
          {session ? (
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Link to="/profile">
                <UserCircle className="h-8 w-8 text-primary cursor-pointer" />
              </Link>
            </motion.div>
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link to="/login">
                <LogIn className="mr-2 h-4 w-4" /> {t('auth.login')}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
  