
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Send, Eye, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const InvoiceItem = ({ client, amount, status, dueDate, id, t }) => (
  <motion.div 
    className="bg-card p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow"
    whileHover={{ y: -5 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex justify-between items-start mb-2">
      <div>
        <h3 className="font-semibold text-lg text-primary">{client}</h3>
        <p className="text-sm text-muted-foreground">{t('invoiceNo', { id })}</p>
      </div>
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
        status === 'Paid' ? 'bg-green-100 text-green-700' : 
        status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
        'bg-red-100 text-red-700'
      }`}>
        {status === 'Paid' ? t('statusPaid') : status === 'Pending' ? t('statusPending') : t('statusOverdue')}
      </span>
    </div>
    <div className="flex justify-between items-center text-sm mb-3">
      <p className="text-foreground">{t('amount')}: <span className="font-bold">{amount}</span></p>
      <p className="text-muted-foreground">{t('due')}: {dueDate}</p>
    </div>
    <div className="flex space-x-2">
      <Button variant="outline" size="sm" className="text-xs"><Eye className="mr-1 h-3 w-3" /> {t('view')}</Button>
      <Button variant="outline" size="sm" className="text-xs"><Download className="mr-1 h-3 w-3" /> {t('download')}</Button>
      {status !== 'Paid' && <Button variant="ghost" size="sm" className="text-xs text-payper-green-default hover:bg-payper-green-default/10"><Send className="mr-1 h-3 w-3" /> {t('sendReminder')}</Button>}
    </div>
  </motion.div>
);

const InvoicesPage = () => {
  const { t } = useTranslation();
  const invoices = [
    { id: 'INV-001', client: 'Tech Solutions Ltd.', amount: 'R 5,500.00', status: 'Paid', dueDate: '2025-04-15' },
    { id: 'INV-002', client: 'Creative Designs Co.', amount: 'R 2,800.00', status: 'Pending', dueDate: '2025-05-20' },
    { id: 'INV-003', client: 'Global Exports Inc.', amount: 'R 12,300.00', status: 'Overdue', dueDate: '2025-04-30' },
  ];

  return (
    <div className="space-y-8 pb-20">
      <motion.h1 
        className="text-3xl font-bold text-primary text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {t('manageInvoices')}
      </motion.h1>

      <motion.div 
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Button size="lg" className="bg-payper-green-default hover:bg-payper-green-dark text-lg py-4 px-8 rounded-full shadow-lg">
          <PlusCircle className="mr-2 h-6 w-6" /> {t('createNewInvoice')}
        </Button>
      </motion.div>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <h2 className="text-xl font-semibold mb-4 text-foreground">{t('invoiceOverview')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-green-500/20 text-green-700 rounded-lg text-center shadow">
            <p className="text-2xl font-bold">R 5,500.00</p>
            <p className="text-sm">{t('statusPaid')}</p>
          </div>
          <div className="p-4 bg-yellow-500/20 text-yellow-700 rounded-lg text-center shadow">
            <p className="text-2xl font-bold">R 2,800.00</p>
            <p className="text-sm">{t('statusPending')}</p>
          </div>
          <div className="p-4 bg-red-500/20 text-red-700 rounded-lg text-center shadow">
            <p className="text-2xl font-bold">R 12,300.00</p>
            <p className="text-sm">{t('statusOverdue')}</p>
          </div>
        </div>
        {invoices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {invoices.map((invoice) => (
              <InvoiceItem key={invoice.id} {...invoice} t={t} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">{t('noInvoicesYet')}</p>
        )}
      </motion.section>
      
      <motion.div 
        className="mt-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <Button variant="link" className="text-primary text-lg">{t('viewAllInvoices')}</Button>
      </motion.div>
    </div>
  );
};

export default InvoicesPage;
  