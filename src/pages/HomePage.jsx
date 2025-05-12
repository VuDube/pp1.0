
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, Bell, FileSpreadsheet, Send, FileText, PlusCircle, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

const StatCard = ({ title, value, icon, color, linkTo, isLoading }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      className={`p-4 sm:p-6 rounded-xl shadow-lg flex flex-col items-start ${color} text-white cursor-pointer h-full`}
      whileHover={{ scale: 1.03, boxShadow: "0px 10px 20px rgba(0,0,0,0.2)" }}
      transition={{ type: "spring", stiffness: 300 }}
      onClick={() => linkTo && navigate(linkTo)}
    >
      <div className="flex items-center justify-between w-full mb-2">
        <h3 className="text-base sm:text-lg font-semibold">{title}</h3>
        {React.cloneElement(icon, { className: "h-6 w-6 sm:h-8 sm:w-8 opacity-70"})}
      </div>
      {isLoading ? (
        <div className="h-8 w-24 bg-white/30 animate-pulse rounded-md"></div>
      ) : (
        <p className="text-2xl sm:text-3xl font-bold">{value}</p>
      )}
      {linkTo && <ArrowRight className="mt-auto self-end h-5 w-5 opacity-80" />}
    </motion.div>
  );
};

const QuickActionCard = ({ title, icon, linkTo, color }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      className={`p-4 rounded-xl shadow-lg flex flex-col items-center justify-center text-center cursor-pointer h-32 sm:h-36 ${color} text-white`}
      whileHover={{ scale: 1.05, y: -5, boxShadow: "0px 10px 20px rgba(0,0,0,0.25)" }}
      transition={{ type: "spring", stiffness: 300 }}
      onClick={() => navigate(linkTo)}
    >
      {React.cloneElement(icon, { className: "h-8 w-8 sm:h-10 sm:h-10 mb-2 opacity-90"})}
      <h3 className="text-sm sm:text-base font-semibold">{title}</h3>
    </motion.div>
  );
};


const TransactionItem = ({ description, amount, date, type, t }) => (
  <motion.li 
    className="flex justify-between items-center p-3 bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div>
      <p className={`font-medium ${type === 'credit' ? 'text-payper-green-default' : 'text-destructive'}`}>{description}</p>
      <p className="text-xs text-muted-foreground">{date}</p>
    </div>
    <span className={`font-semibold ${type === 'credit' ? 'text-payper-green-default' : 'text-destructive'}`}>
      {type === 'credit' ? '+' : '-'} {amount}
    </span>
  </motion.li>
);

const HomePage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [recentTransactions, setRecentTransactions] = useState([]);
  const [outstandingInvoicesCount, setOutstandingInvoicesCount] = useState(0);
  const [totalPayments, setTotalPayments] = useState(0);
  const [loading, setLoading] = useState(true);

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || t('user');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Mock data fetching - replace with actual Supabase calls
      // For recent transactions (example: fetch last 3 payment records)
      // const { data: paymentsData, error: paymentsError } = await supabase
      //   .from('payments') // Assuming you have a 'payments' table
      //   .select('*')
      //   .eq('user_id', user.id) // Filter by user
      //   .order('created_at', { ascending: false })
      //   .limit(3);
      // if (paymentsData) setRecentTransactions(paymentsData.map(p => ({...p, type: p.amount > 0 ? 'credit' : 'debit'})));
      
      // For outstanding invoices (example: count invoices where status is 'pending' or 'overdue')
      // const { count, error: invoicesError } = await supabase
      //   .from('invoices') // Assuming you have an 'invoices' table
      //   .select('*', { count: 'exact', head: true })
      //   .eq('user_id', user.id)
      //   .in('status', ['pending', 'overdue']);
      // if (count) setOutstandingInvoicesCount(count);

      // For total payments (example: sum of amounts from payments table)
      // const { data: totalPaymentsData, error: totalPaymentsError } = await supabase
      //  .from('payments')
      //  .select('amount')
      //  .eq('user_id', user.id)
      //  .gt('amount', 0); // Assuming positive amounts are payments made by user
      // if (totalPaymentsData) setTotalPayments(totalPaymentsData.reduce((sum, p) => sum + p.amount, 0));

      // Using mock data for now:
      setTimeout(() => {
        setRecentTransactions([
          { id: 1, description: t('paidTo', {recipient: 'Eskom', amount: ''}), amount: 'R350.00', date: '2025-05-06', type: 'debit' },
          { id: 2, description: t('receivedFrom', {sender: 'Client X', amount: ''}), amount: 'R1200.00', date: '2025-05-05', type: 'credit' },
          { id: 3, description: t('paidTo', {recipient: 'Netflix', amount: ''}), amount: 'R169.00', date: '2025-05-01', type: 'debit' },
        ]);
        setOutstandingInvoicesCount(2);
        setTotalPayments(519.00); // Sum of debits
        setLoading(false);
      }, 1000);
    };

    if (user) {
      fetchData();
    }
  }, [user, t]);


  return (
    <div className="space-y-6 sm:space-y-8 pb-24">
      <motion.section 
        className="py-6 sm:py-8 payper-gradient-bg rounded-xl shadow-xl text-white"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="container mx-auto px-4">
          <h1 className="text-2xl sm:text-3xl font-bold">
            {t('greeting.hello')}, {userName}!
          </h1>
          <p className="text-sm sm:text-base text-primary-foreground/90">{t('greeting.welcomeBack')}</p>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <StatCard 
            title={t('dashboard.totalSpentThisMonth')} 
            value={`R ${totalPayments.toFixed(2)}`} 
            icon={<TrendingUp />} 
            color="bg-payper-blue-default" 
            linkTo="/payments"
            isLoading={loading}
          />
          <StatCard 
            title={t('dashboard.outstandingInvoices')} 
            value={outstandingInvoicesCount.toString()} 
            icon={<FileSpreadsheet />} 
            color="bg-payper-green-default" 
            linkTo="/invoices"
            isLoading={loading}
          />
          <StatCard 
            title={t('dashboard.unreadNotifications')} 
            value={`0 ${t('new')}`} 
            icon={<Bell />} 
            color="bg-yellow-500" 
            linkTo="/profile" 
            isLoading={loading}
          />
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-primary">{t('quickActions')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <QuickActionCard title={t('makePayment')} icon={<Send />} linkTo="/payments" color="bg-primary hover:bg-primary/90" />
          <QuickActionCard title={t('createInvoice')} icon={<PlusCircle />} linkTo="/invoices" color="bg-secondary hover:bg-secondary/90" />
          <QuickActionCard title={t('viewReceipts')} icon={<FileText />} linkTo="/receipts" color="bg-primary hover:bg-primary/90" />
          <QuickActionCard title={t('viewProfile')} icon={<User />} linkTo="/profile" color="bg-secondary hover:bg-secondary/90" />
        </div>
      </motion.section>

      <motion.section 
        className="p-4 sm:p-6 bg-card rounded-xl shadow-lg"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground">{t('recentTransactions')}</h2>
          <Button variant="link" className="text-primary px-0" onClick={() => navigate('/payments')}>
            {t('viewAll')} <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        {loading ? (
            <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-background rounded-lg shadow-sm">
                        <div>
                            <div className="h-5 w-32 bg-muted animate-pulse rounded-md mb-1"></div>
                            <div className="h-3 w-20 bg-muted animate-pulse rounded-md"></div>
                        </div>
                        <div className="h-5 w-16 bg-muted animate-pulse rounded-md"></div>
                    </div>
                ))}
            </div>
        ) : recentTransactions.length > 0 ? (
          <ul className="space-y-3">
            {recentTransactions.map((item) => (
              <TransactionItem 
                key={item.id} 
                description={item.description} 
                amount={item.amount} 
                date={item.date}
                type={item.type}
                t={t}
              />
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-center py-4">{t('dashboard.noRecentTransactions')}</p>
        )}
      </motion.section>
    </div>
  );
};

export default HomePage;
  