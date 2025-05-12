
import React from 'react';
import { motion } from 'framer-motion';
import { Download, Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const DocumentViewer = ({
  document,
  type = 'receipt',
  onEdit,
  onDelete,
  onDownload,
  className
}) => {
  const { t } = useTranslation();
  
  const formatDate = (date) => {
    try {
      return format(new Date(date), 'PPP');
    } catch (error) {
      return t('dateUnavailable');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "bg-card rounded-lg shadow-lg overflow-hidden transition-shadow hover:shadow-xl",
        className
      )}
    >
      {document.image_url && (
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={document.image_url}
            alt={type === 'receipt' ? t('documents.receipt') : t('documents.invoice')}
            className="object-cover w-full h-full transition-transform hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      )}
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {type === 'receipt' ? document.merchant_name : document.client_name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {formatDate(type === 'receipt' ? document.date : document.issue_date)}
            </p>
          </div>
          <div className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            getStatusColor(document.status)
          )}>
            {t(`status${document.status}`)}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-lg font-bold text-foreground">
            {document.currency} {parseFloat(document.amount).toFixed(2)}
          </p>
          {type === 'receipt' && document.category && (
            <p className="text-sm text-muted-foreground">
              {t('category')}: {document.category}
            </p>
          )}
          {type === 'invoice' && (
            <>
              <p className="text-sm text-muted-foreground">
                {t('invoiceNo')}: {document.invoice_number}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('dueDate')}: {formatDate(document.due_date)}
              </p>
            </>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit(document)}
          >
            <Pencil className="w-4 h-4 mr-1" />
            {t('edit')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onDownload(document)}
          >
            <Download className="w-4 h-4 mr-1" />
            {t('download')}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(document)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default DocumentViewer;
  