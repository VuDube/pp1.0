
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle2, FileText, Home } from 'lucide-react';

const PaymentSuccessPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { state: transactionDetails } = location;

  if (!transactionDetails) {
    // Redirect to home or payments if no transaction details are found
    navigate('/');
    return null;
  }

  const { amount, currency, recipientName, type, note, created_at, id, stripe_payment_intent_id } = transactionDetails;
  const displayAmount = typeof amount === 'number' ? amount.toFixed(2) : parseFloat(amount || 0).toFixed(2);
  const displayRecipient = recipientName || transactionDetails.recipient_email_phone || transactionDetails.merchant_name || t('paymentSuccess.unknownRecipient');
  const transactionDate = created_at ? new Date(created_at).toLocaleDateString(t('localeCode', {defaultValue: 'en-ZA'}), { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : t('paymentSuccess.dateUnavailable');

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] text-center p-4 pb-20"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
    >
      <CheckCircle2 className="w-24 h-24 text-payper-green-default mb-6" />
      <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-3">
        {t('paymentSuccess.title')}
      </h1>
      <p className="text-lg text-muted-foreground mb-8">
        {type === 'p2p' 
          ? t('paymentSuccess.p2pMessage', { amount: displayAmount, currency, recipient: displayRecipient })
          : t('paymentSuccess.merchantMessage', { amount: displayAmount, currency, merchant: displayRecipient })}
      </p>

      <div className="bg-card p-6 rounded-xl shadow-lg w-full max-w-md mb-8 text-left space-y-3">
        <h2 className="text-xl font-semibold text-foreground border-b pb-2 mb-3">{t('paymentSuccess.summaryTitle')}</h2>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t('p2p.amountLabel')}:</span>
          <span className="font-semibold text-foreground">{currency} {displayAmount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{type === 'p2p' ? t('p2p.recipientLabel') : t('merchantPayment.merchantLabel')}:</span>
          <span className="font-semibold text-foreground">{displayRecipient}</span>
        </div>
        {note && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('p2p.noteLabel')}:</span>
            <span className="font-semibold text-foreground truncate max-w-[70%]">{note}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t('paymentSuccess.dateLabel')}:</span>
          <span className="font-semibold text-foreground">{transactionDate}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t('paymentSuccess.transactionIdLabel')}:</span>
          <span className="font-semibold text-foreground truncate max-w-[70%]">{id || stripe_payment_intent_id}</span>
        </div>
         {type === 'merchant' && stripe_payment_intent_id && (
           <div className="flex justify-between">
            <span className="text-muted-foreground">{t('paymentSuccess.stripeIdLabel')}:</span>
            <span className="font-semibold text-foreground truncate max-w-[70%]">{stripe_payment_intent_id}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <Button 
          onClick={() => navigate('/')} 
          className="w-full bg-payper-blue-default hover:bg-payper-blue-dark text-lg p-6 h-14 rounded-lg"
        >
          <Home className="mr-2 h-5 w-5" /> {t('paymentSuccess.backToHome')}
        </Button>
        <Button 
          onClick={() => navigate('/receipts')} 
          variant="outline" 
          className="w-full text-lg p-6 h-14 rounded-lg border-primary text-primary hover:bg-primary/10"
        >
          <FileText className="mr-2 h-5 w-5" /> {t('paymentSuccess.viewReceipts')}
        </Button>
      </div>
    </motion.div>
  );
};

export default PaymentSuccessPage;
  