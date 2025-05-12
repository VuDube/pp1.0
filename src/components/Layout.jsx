
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { motion } from 'framer-motion';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <motion.main 
        className="flex-grow container mx-auto px-4 py-6 sm:py-8 overflow-y-auto mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Outlet />
      </motion.main>
      <BottomNav />
    </div>
  );
};

export default Layout;
  