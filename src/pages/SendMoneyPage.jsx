
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; 
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Send, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';

const SendMoneyPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formError, setFormError] = useState('');

  const validateForm = () => {
    if (!recipient.trim()) {
      setFormError(t('p2p.error.recipientRequired'));
      return false;
    }
    if (!amount.trim() || parseFloat(amount) <= 0) {
      setFormError(t('p2p.error.invalidAmount'));
      return false;
    }
    if (isNaN(parseFloat(amount))) {
      setFormError(t('p2p.error.amountMustBeNumber'));
      return false;
    }
    setFormError('');
    return true;
  };

  const handleProceedToConfirmation = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setShowConfirmation(true);
    }
  };

  const handleSendMoney = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: t('toast.error'),
        description: t('auth.mustBeLoggedIn'),
      });
      setIsLoading(false);
      setShowConfirmation(false);
      return;
    }

    setIsLoading(true);
    setShowConfirmation(false);

    try {
      // Check if recipient exists
      let recipientUser = null;
      const { data: existingUserByEmail, error: emailError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('email', recipient.trim())
        .single();

      if (existingUserByEmail) {
        recipientUser = existingUserByEmail;
      } else {
        // Potentially check by phone if you implement that
        // For now, if not found by email, we assume it's an external recipient or new user
      }
      
      const transactionData = {
        sender_id: user.id,
        recipient_id: recipientUser ? recipientUser.id : null,
        recipient_email_phone: recipient.trim(),
        amount: parseFloat(amount),
        currency: 'ZAR',
        note: note.trim(),
        type: 'p2p',
        status: 'completed', // Simplified: assume direct completion
      };

      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([transactionData]);

      if (transactionError) {
        throw transactionError;
      }

      toast({
        title: t('toast.success'),
        description: t('p2p.paymentSentSuccess', { amount: parseFloat(amount).toFixed(2), recipient: recipientUser?.full_name || recipient.trim() }),
        action: <CheckCircle2 className="text-green-500" />,
      });
      navigate('/payments/success', { state: { ...transactionData, recipientName: recipientUser?.full_name || recipient.trim() } });

    } catch (error) {
      console.error("P2P Payment Error:", error);
      toast({
        variant: "destructive",
        title: t('toast.error'),
        description: error.message || t('p2p.paymentSentError'),
        action: <AlertTriangle className="text-red-500" />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      className="space-y-6 pb-20 max-w-md mx-auto"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/payments')} className="mr-2">
          <ArrowLeft />
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">{t('sendMoney')}</h1>
      </div>

      <form onSubmit={handleProceedToConfirmation} className="space-y-6 p-6 bg-card rounded-xl shadow-xl">
        <div>
          <Label htmlFor="recipient" className="text-lg">{t('p2p.recipientLabel')}</Label>
          <Input
            id="recipient"
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder={t('p2p.recipientPlaceholder')}
            className="mt-1 text-lg p-4 h-14 rounded-lg"
            disabled={isLoading}
          />
          <p className="text-sm text-muted-foreground mt-1">{t('p2p.recipientHint')}</p>
        </div>

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
          />
        </div>

        <div>
          <Label htmlFor="note" className="text-lg">{t('p2p.noteLabel')} ({t('optional')})</Label>
          <Textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('p2p.notePlaceholder')}
            className="mt-1 text-lg p-4 rounded-lg min-h-[100px]"
            disabled={isLoading}
          />
        </div>
        
        {formError && <p className="text-destructive text-sm flex items-center"><AlertTriangle className="w-4 h-4 mr-1"/> {formError}</p>}

        <Button 
          type="submit" 
          className="w-full bg-payper-blue-default hover:bg-payper-blue-dark text-lg p-6 h-16 rounded-lg flex items-center justify-center"
          disabled={isLoading}
        >
          {isLoading ? t('auth.loading') : t('p2p.proceedToConfirmation')} <Send className="ml-2 h-5 w-5" />
        </Button>
      </form>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-primary">{t('p2p.confirmPaymentTitle')}</DialogTitle>
            <DialogDescription className="text-base">
              {t('p2p.confirmPaymentDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 my-4 text-lg">
            <p><strong>{t('p2p.recipientLabel')}:</strong> {recipient}</p>
            <p><strong>{t('p2p.amountLabel')}:</strong> R {parseFloat(amount || 0).toFixed(2)}</p>
            {note && <p><strong>{t('p2p.noteLabel')}:</strong> {note}</p>}
          </div>
          <DialogFooter className="sm:justify-between gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="w-full sm:w-auto text-lg p-3 h-12 rounded-md" disabled={isLoading}>
                {t('cancel')}
              </Button>
            </DialogClose>
            <Button 
              type="button" 
              onClick={handleSendMoney} 
              className="w-full sm:w-auto bg-payper-green-default hover:bg-payper-green-dark text-lg p-3 h-12 rounded-md"
              disabled={isLoading}
            >
              {isLoading ? t('auth.loading') : t('p2p.confirmAndSend')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default SendMoneyPage;
  