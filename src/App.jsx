
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import PaymentsPage from '@/pages/PaymentsPage';
import SendMoneyPage from '@/pages/SendMoneyPage';
import MerchantPaymentPage from '@/pages/MerchantPaymentPage';
import PaymentSuccessPage from '@/pages/PaymentSuccessPage';
import ReceiptsPage from '@/pages/ReceiptsPage';
import InvoicesPage from '@/pages/InvoicesPage';
import TransactionHistoryPage from '@/pages/TransactionHistoryPage';
import FinancialTipsPage from '@/pages/FinancialTipsPage';
import ProfilePage from '@/pages/ProfilePage';
import OnboardingPage from '@/pages/OnboardingPage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import UpdatePasswordPage from '@/pages/UpdatePasswordPage';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import ErrorBoundary from '@/components/ErrorBoundary';
import LoadingSpinner from '@/components/LoadingSpinner';

const pageVariants = {
  initial: { opacity: 0, scale: 0.95 },
  in: { opacity: 1, scale: 1 },
  out: { opacity: 0, scale: 0.95 }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.4
};

const AnimatedPage = ({ children }) => (
  <motion.div
    initial="initial"
    animate="in"
    exit="out"
    variants={pageVariants}
    transition={pageTransition}
  >
    {children}
  </motion.div>
);

function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="xl" text="Loading..." />
      </div>
    );
  }
  
  return session ? children : <Navigate to="/login" replace />;
}

function AnimatedRoutes() {
  const location = useLocation();
  const { session } = useAuth();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<AnimatedPage><LoginPage /></AnimatedPage>} />
        <Route path="/signup" element={<AnimatedPage><SignupPage /></AnimatedPage>} />
        <Route path="/forgot-password" element={<AnimatedPage><ForgotPasswordPage /></AnimatedPage>} />
        <Route path="/update-password" element={<AnimatedPage><UpdatePasswordPage /></AnimatedPage>} />
        
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AnimatedPage><HomePage /></AnimatedPage>} />
          <Route path="payments" element={<AnimatedPage><PaymentsPage /></AnimatedPage>} />
          <Route path="payments/send" element={<AnimatedPage><SendMoneyPage /></AnimatedPage>} />
          <Route path="payments/merchant" element={<AnimatedPage><MerchantPaymentPage /></AnimatedPage>} />
          <Route path="payments/success" element={<AnimatedPage><PaymentSuccessPage /></AnimatedPage>} />
          <Route path="transactions" element={<AnimatedPage><TransactionHistoryPage /></AnimatedPage>} />
          <Route path="receipts" element={<AnimatedPage><ReceiptsPage /></AnimatedPage>} />
          <Route path="invoices" element={<AnimatedPage><InvoicesPage /></AnimatedPage>} />
          <Route path="tips" element={<AnimatedPage><FinancialTipsPage /></AnimatedPage>} />
          <Route path="profile" element={<AnimatedPage><ProfilePage /></AnimatedPage>} />
        </Route>
        
        {session && <Route path="*" element={<Navigate to="/" replace />} />}
        {!session && <Route path="*" element={<Navigate to="/login" replace />} />}
      </Routes>
    </AnimatePresence>
  );
}

function AppContent() {
  const { i18n } = useTranslation();
  const { loading: authLoading, user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      const storedLang = localStorage.getItem('i18nextLng');
      const userLang = user?.user_metadata?.preferred_language;

      if (userLang) {
        if (i18n.language !== userLang) {
           i18n.changeLanguage(userLang);
        }
        localStorage.setItem('i18nextLng', userLang); 
        setShowOnboarding(false);
      } else if (storedLang) {
         if (i18n.language !== storedLang) {
            i18n.changeLanguage(storedLang);
         }
        setShowOnboarding(false);
      } else {
        setShowOnboarding(true);
      }
      setInitialCheckDone(true);
    }
  }, [i18n, authLoading, user]);

  const handleLanguageSelected = () => {
    setShowOnboarding(false);
  };

  if (!initialCheckDone || authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="xl" text="Loading..." />
      </div>
    );
  }

  if (showOnboarding && !user) { 
    return <OnboardingPage onLanguageSelected={handleLanguageSelected} />;
  }

  return (
    <Router>
      <ErrorBoundary>
        <AnimatedRoutes />
        <Toaster />
      </ErrorBoundary>
    </Router>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
