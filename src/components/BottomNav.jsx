
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, CreditCard, FileText, FileSpreadsheet, Lightbulb, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

const BottomNav = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { path: '/', labelKey: 'home', icon: Home },
    { path: '/payments', labelKey: 'payments', icon: CreditCard },
    { path: '/receipts', labelKey: 'receipts', icon: FileText },
    { path: '/invoices', labelKey: 'invoices', icon: FileSpreadsheet },
    { path: '/tips', labelKey: 'tips', icon: Lightbulb },
    { path: '/profile', labelKey: 'profile', icon: User },
  ];

  return (
    <motion.nav 
      className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-top-md z-40"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.2 }}
    >
      <div className="container mx-auto flex justify-around items-stretch h-16 px-1 sm:px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive: navIsActive }) =>
                cn(
                  "flex flex-col items-center justify-center text-xs font-medium p-1 sm:p-2 rounded-lg transition-all duration-200 ease-in-out w-1/6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                  navIsActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary hover:bg-accent"
                )
              }
            >
              <motion.div 
                className="flex flex-col items-center justify-center"
                whileHover={{ scale: navItems.length > 5 ? 1.05 : 1.1 }} // Less aggressive hover for more items
                whileTap={{ scale: 0.95 }}
              >
                <item.icon className={cn("h-5 w-5 sm:h-6 sm:w-6 mb-0.5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
                <span className={cn("truncate w-full text-center", isActive ? "font-semibold text-primary" : "text-muted-foreground")}>{t(item.labelKey)}</span>
              </motion.div>
            </NavLink>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default BottomNav;
  