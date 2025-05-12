
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { format, subDays, isWithinInterval, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import {
  Calendar,
  Search,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  FileText,
  Store,
} from 'lucide-react';

const TransactionHistoryPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError(error.message);
      toast({
        variant: "destructive",
        title: t('toast.error'),
        description: t('error.genericError'),
        action: <AlertTriangle className="h-5 w-5" />,
      });
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type, transaction, userId) => {
    switch (type) {
      case 'p2p':
        return userId === transaction.sender_id ? 
          <ArrowUpRight className="h-6 w-6 text-red-500" /> :
          <ArrowDownLeft className="h-6 w-6 text-green-500" />;
      case 'receipt':
        return <Receipt className="h-6 w-6 text-blue-500" />;
      case 'invoice':
        return <FileText className="h-6 w-6 text-purple-500" />;
      case 'merchant':
        return <Store className="h-6 w-6 text-orange-500" />;
      default:
        return <ArrowUpRight className="h-6 w-6 text-gray-500" />;
    }
  };

  const getDateRangeFilter = (date) => {
    const today = new Date();
    switch (dateRange) {
      case '7days':
        return isWithinInterval(parseISO(date), {
          start: subDays(today, 7),
          end: today,
        });
      case '30days':
        return isWithinInterval(parseISO(date), {
          start: subDays(today, 30),
          end: today,
        });
      case '90days':
        return isWithinInterval(parseISO(date), {
          start: subDays(today, 90),
          end: today,
        });
      default:
        return true;
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = (
      (transaction.merchant_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (transaction.recipient_email_phone?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (transaction.amount?.toString().includes(searchQuery))
    );
    
    const matchesType = selectedType === 'all' || transaction.type === selectedType;
    const matchesDate = getDateRangeFilter(transaction.created_at);

    return matchesSearch && matchesType && matchesDate;
  });

  const formatAmount = (amount, currency) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency || 'ZAR'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <motion.h1 
        className="text-3xl font-bold text-primary text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {t('transactionHistory')}
      </motion.h1>

      <motion.div 
        className="grid gap-4 md:grid-cols-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="relative">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchTransactions')}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>

        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger>
            <SelectValue placeholder={t('filter')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allTypes')}</SelectItem>
            <SelectItem value="p2p">{t('p2pPayment')}</SelectItem>
            <SelectItem value="merchant">{t('merchantPayment')}</SelectItem>
            <SelectItem value="receipt">{t('receipt')}</SelectItem>
            <SelectItem value="invoice">{t('invoice')}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger>
            <SelectValue placeholder={t('dateRange')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allTime')}</SelectItem>
            <SelectItem value="7days">{t('last7Days')}</SelectItem>
            <SelectItem value="30days">{t('last30Days')}</SelectItem>
            <SelectItem value="90days">{t('last90Days')}</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center items-center py-12"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </motion.div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive">{error}</p>
            <Button
              onClick={fetchTransactions}
              className="mt-4"
              variant="outline"
            >
              {t('tryAgain')}
            </Button>
          </motion.div>
        ) : filteredTransactions.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {filteredTransactions.map((transaction) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-card rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getTransactionIcon(transaction.type, transaction, user.id)}
                    <div>
                      <h3 className="font-medium">
                        {transaction.merchant_name || transaction.recipient_email_phone || t('unknownRecipient')}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {format(parseISO(transaction.created_at), 'PPP')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      user.id === transaction.sender_id ? 'text-red-500' : 'text-green-500'
                    }`}>
                      {user.id === transaction.sender_id ? '-' : '+'}
                      {formatAmount(transaction.amount, transaction.currency)}
                    </p>
                    <span className="text-xs px-2 py-1 rounded-full bg-muted">
                      {transaction.status}
                    </span>
                  </div>
                </div>
                {transaction.note && (
                  <p className="mt-2 text-sm text-muted-foreground">{transaction.note}</p>
                )}
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12 text-muted-foreground"
          >
            {t('noTransactionsFound')}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TransactionHistoryPage;
