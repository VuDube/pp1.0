
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, CreditCard, AlertTriangle, CheckCircle2, ShoppingBag } from 'lucide-react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const MOCK_MERCHANTS = [
  { id: 'merchant_1', name: 'Woolworths Online', priceId: 'price_1PObZQR31IunYUcLn7ZgX2xP' },
  { id: 'merchant_2', name: 'Takealot', priceId: 'price_1PObZqR31IunYUcLXqgYfWqP' },
  { id: 'merchant_3', name: 'Netflix Subscription', priceId: 'price_1PObaER31IunYUcL5x0tHqfK' },
];

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#32325d",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4"
      },
      iconColor: '#0074c2',
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a"
    }
  },
  classes: {
    base: 'p-4 border border-input rounded-lg bg-background',
    focus: 'focus-within:ring-2 focus-within:ring-ring',
    invalid: 'border-destructive',
  }
};

const MerchantPaymentPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const stripe = useStripe();
  const elements = useElements();

  const [selectedMerchant, setSelectedMerchant] = useState(MOCK_MERCHANTS[0].id);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRecovering, setIsRecovering] = useState(false);

  const currentMerchant = MOCK_MERCHANTS.find(m => m.id === selectedMerchant);

  const handlePaymentError = async (error, transactionId = null) => {
    console.error('Payment Error:', error);
    setPaymentError(error.message || t('merchantPayment.error.paymentFailed'));
    setErrorDetails({
      title: t('toast.error'),
      message: error.message || t('merchantPayment.error.paymentFailed'),
      transactionId
    });
    setShowErrorDialog(true);
    setIsLoading(false);
  };

  const rollbackTransaction = async (transactionId) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ status: 'failed', updated_at: new Date().toISOString() })
        .eq('id', transactionId);

      if (error) throw error;
    } catch (error) {
      console.error('Rollback Error:', error);
      // Log to monitoring service in production
    }
  };

  const createPaymentIntent = async (paymentAmount) => {
    if (!user) {
      throw new Error(t('auth.mustBeLoggedIn'));
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          amount: Math.round(paymentAmount * 100),
          currency: 'zar',
          userId: user.id,
          merchantId: currentMerchant.id,
          description: `Payment to ${currentMerchant.name}`
        }
      });

      if (error) throw error;
      if (!data?.clientSecret) {
        throw new Error(t('merchantPayment.error.failedToCreatePaymentIntent'));
      }

      return data.clientSecret;
    } catch (error) {
      throw new Error(error.message || t('merchantPayment.error.failedToCreatePaymentIntent'));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setPaymentError(null);

    if (!stripe || !elements) {
      setPaymentError(t('merchantPayment.error.stripeNotLoaded'));
      return;
    }

    if (!user) {
      toast({
        variant: "destructive",
        title: t('toast.error'),
        description: t('auth.mustBeLoggedIn')
      });
      return;
    }

    setIsLoading(true);
    const cardElement = elements.getElement(CardElement);
    const paymentAmount = parseFloat(amount) || (currentMerchant.defaultAmount || 50);

    try {
      // 1. Create initial transaction record
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          sender_id: user.id,
          merchant_name: currentMerchant.name,
          amount: paymentAmount,
          currency: 'ZAR',
          note: `Payment to ${currentMerchant.name}`,
          type: 'merchant',
          status: 'pending'
        }])
        .select()
        .single();

      if (transactionError) throw transactionError;

      // 2. Create PaymentIntent
      const clientSecret = await createPaymentIntent(paymentAmount);

      // 3. Confirm Card Payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              email: user.email,
            },
          },
        }
      );

      if (stripeError) {
        await rollbackTransaction(transaction.id);
        throw stripeError;
      }

      if (paymentIntent.status === 'succeeded') {
        // 4. Update transaction record
        const { error: updateError } = await supabase
          .from('transactions')
          .update({
            status: 'completed',
            stripe_payment_intent_id: paymentIntent.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', transaction.id);

        if (updateError) {
          console.error('Transaction Update Error:', updateError);
          // Log to monitoring service but don't fail the payment
        }

        toast({
          title: t('toast.success'),
          description: t('merchantPayment.paymentSuccessMessage', {
            amount: paymentAmount.toFixed(2),
            merchant: currentMerchant.name
          }),
          action: <CheckCircle2 className="text-green-500" />
        });

        navigate('/payments/success', {
          state: {
            ...transaction,
            stripe_payment_intent_id: paymentIntent.id,
            status: 'completed'
          }
        });
      } else {
        throw new Error(t('merchantPayment.error.paymentNotSucceeded'));
      }
    } catch (error) {
      handlePaymentError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMerchantChange = (value) => {
    setSelectedMerchant(value);
    const newMerchant = MOCK_MERCHANTS.find(m => m.id === value);
    if (newMerchant?.defaultAmount) {
      setAmount(newMerchant.defaultAmount.toString());
    } else {
      setAmount('');
    }
  };

  const handleRetry = () => {
    setShowErrorDialog(false);
    setPaymentError(null);
    setRetryCount(prev => prev + 1);
  };

  return (
    <motion.div 
      className="space-y-6 pb-20 max-w-md mx-auto"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/payments')}
          className="mr-2"
          disabled={isLoading}
        >
          <ArrowLeft />
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">{t('payMerchant')}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-card rounded-xl shadow-xl">
        <div>
          <Label htmlFor="merchant" className="text-lg">{t('merchantPayment.selectMerchant')}</Label>
          <Select value={selectedMerchant} onValueChange={handleMerchantChange} disabled={isLoading}>
            <SelectTrigger className="w-full mt-1 text-lg p-4 h-14 rounded-lg">
              <SelectValue placeholder={t('merchantPayment.selectMerchantPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {MOCK_MERCHANTS.map(merchant => (
                <SelectItem key={merchant.id} value={merchant.id} className="text-lg">
                  {merchant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {(!currentMerchant?.defaultAmount || !currentMerchant) && (
          <div>
            <Label htmlFor="amount" className="text-lg">{t('p2p.amountLabel')} (ZAR)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="mt-1 text-lg p-4 h-14 rounded-lg"
              disabled={isLoading}
              step="0.01"
              required
            />
          </div>
        )}

        {currentMerchant?.defaultAmount && (
          <div>
            <Label htmlFor="amount" className="text-lg">{t('p2p.amountLabel')} (ZAR)</Label>
            <Input
              id="amount"
              type="number"
              value={currentMerchant.defaultAmount.toString()}
              className="mt-1 text-lg p-4 h-14 rounded-lg bg-muted"
              disabled={true}
            />
          </div>
        )}

        <div>
          <Label htmlFor="card-element" className="text-lg">{t('merchantPayment.cardDetails')}</Label>
          <div id="card-element" className="mt-1">
            <CardElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>

        {paymentError && !showErrorDialog && (
          <p className="text-destructive text-sm flex items-center">
            <AlertTriangle className="w-4 h-4 mr-1"/> {paymentError}
          </p>
        )}

        <Button 
          type="submit" 
          className="w-full bg-payper-green-default hover:bg-payper-green-dark text-lg p-6 h-16 rounded-lg flex items-center justify-center"
          disabled={!stripe || isLoading}
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              {t('auth.loading')}
            </div>
          ) : (
            <>
              {t('merchantPayment.payNowButton')} R {parseFloat(amount || (currentMerchant?.defaultAmount || 0)).toFixed(2)}
              <CreditCard className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </form>

      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{errorDetails?.title || t('toast.error')}</AlertDialogTitle>
            <AlertDialogDescription>
              {errorDetails?.message}
              {errorDetails?.transactionId && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Transaction ID: {errorDetails.transactionId}
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>
              {t('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRetry}
              disabled={isLoading || retryCount >= 3}
              className="bg-payper-blue-default hover:bg-payper-blue-dark"
            >
              {t('merchantPayment.retryPayment')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default MerchantPaymentPage;
  