
import React from 'react';
import { Button } from '@/components/ui/button';
import { Send, PlusCircle, History, ShoppingCart, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const ActionButton = ({ icon, label, onClick, variant = "default", className }) => (
  <motion.div 
    whileHover={{ scale: 1.02 }} 
    whileTap={{ scale: 0.98 }}
    className="w-full"
  >
    <Button 
      variant={variant}
      size="xl"
      className={`w-full h-24 flex flex-col items-center justify-center space-y-2 text-lg font-medium shadow-lg ${className}`}
      onClick={onClick}
    >
      {React.cloneElement(icon, { className: "h-8 w-8 mb-2" })}
      <span className="text-base">{label}</span>
    </Button>
  </motion.div>
);

const PaymentsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const recentTransactionsData = [
    { type: 'paidTo', recipient: 'Eskom', amount: 'R350.00', date: t('mockDate1') },
    { type: 'receivedFrom', sender: 'John D.', amount: 'R150.00', date: t('mockDate2') },
    { type: 'paidTo', recipient: 'Telkom', amount: 'R220.50', date: t('mockDate3') },
  ];

  return (
    <div className="space-y-8 pb-20">
      <motion.h1 
        className="text-3xl font-bold text-primary text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {t('payments')}
      </motion.h1>

      <motion.section 
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <ActionButton 
          icon={<Send />} 
          label={t('sendMoney')} 
          variant="default"
          className="bg-payper-blue-default hover:bg-payper-blue-dark text-white"
          onClick={() => navigate('/payments/send')}
        />
        <ActionButton 
          icon={<ShoppingCart />} 
          label={t('payMerchant')} 
          variant="secondary"
          className="bg-payper-green-default hover:bg-payper-green-dark text-white"
          onClick={() => navigate('/payments/merchant')}
        />
      </motion.section>

      <motion.section 
        className="p-6 bg-card rounded-xl shadow-lg"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-foreground">{t('recentTransactions')}</h2>
          <Button 
            variant="link" 
            className="text-primary hover:text-primary/80 font-medium"
            onClick={() => navigate('/transactions')}
          >
            {t('viewAll')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        
        <ul className="space-y-3">
          {recentTransactionsData.map((item, index) => (
            <motion.li 
              key={index} 
              className="flex justify-between items-center p-4 bg-background rounded-lg shadow-sm hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex flex-col">
                <span className="text-foreground font-medium">
                  {item.type === 'paidTo' 
                    ? t('paidTo', { recipient: item.recipient, amount: '' }) 
                    : t('receivedFrom', { sender: item.sender, amount: '' })}
                </span>
                <span className={`text-lg font-semibold ${
                  item.type === 'paidTo' ? 'text-destructive' : 'text-payper-green-default'
                }`}>
                  {item.amount}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">{item.date}</span>
            </motion.li>
          ))}
          {recentTransactionsData.length === 0 && (
            <p className="text-muted-foreground text-center py-4">{t('dashboard.noRecentTransactions')}</p>
          )}
        </ul>
      </motion.section>
      
      <motion.section
        className="p-6 glassmorphism-card"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <h2 className="text-xl font-semibold mb-4 text-foreground">{t('scheduledPayments')}</h2>
        <p className="text-sm text-muted-foreground mb-4">{t('noScheduledPayments')}</p>
        <Button 
          size="lg"
          className="w-full bg-payper-blue-default hover:bg-payper-blue-dark text-white"
        >
          <PlusCircle className="mr-2 h-5 w-5" /> 
          {t('scheduleNewPayment')}
        </Button>
      </motion.section>
    </div>
  );
};

export default PaymentsPage;
