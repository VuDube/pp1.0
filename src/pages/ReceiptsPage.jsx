
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UploadCloud, Search, Filter, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import ImageUploader from '@/components/ImageUploader';
import DocumentViewer from '@/components/DocumentViewer';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ReceiptsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [receiptToDelete, setReceiptToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [uploadData, setUploadData] = useState({
    file: null,
    merchantName: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    currency: 'ZAR'
  });

  // Fetch receipts on component mount
  React.useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setReceipts(data || []);
    } catch (error) {
      console.error('Error fetching receipts:', error);
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

  const handleImageCapture = (file) => {
    setUploadData(prev => ({ ...prev, file }));
  };

  const handleUpload = async () => {
    if (!uploadData.file || !uploadData.merchantName || !uploadData.amount) {
      toast({
        variant: "destructive",
        title: t('toast.error'),
        description: t('documents.fillRequiredFields'),
        action: <AlertTriangle className="h-5 w-5" />,
      });
      return;
    }

    try {
      setLoading(true);

      // 1. Upload image to Storage
      const fileExt = uploadData.file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, uploadData.file);

      if (uploadError) throw uploadError;

      // 2. Get public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // 3. Create receipt record in database
      const { data: receipt, error: dbError } = await supabase
        .from('receipts')
        .insert([{
          user_id: user.id,
          merchant_name: uploadData.merchantName,
          amount: parseFloat(uploadData.amount),
          currency: uploadData.currency,
          date: uploadData.date,
          category: uploadData.category,
          image_url: publicUrl,
          status: 'completed'
        }])
        .select()
        .single();

      if (dbError) throw dbError;

      // 4. Update local state
      setReceipts(prev => [receipt, ...prev]);
      setShowUploadDialog(false);
      setUploadData({
        file: null,
        merchantName: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: '',
        currency: 'ZAR'
      });

      toast({
        title: t('toast.success'),
        description: t('documents.receiptUploadSuccess'),
        action: <CheckCircle2 className="text-green-500 h-5 w-5" />,
      });

    } catch (error) {
      console.error('Error uploading receipt:', error);
      toast({
        variant: "destructive",
        title: t('toast.error'),
        description: t('documents.uploadError'),
        action: <AlertTriangle className="h-5 w-5" />,
      });
    } finally {
      setLoading(false);
    }
  };

  const initiateDelete = (receipt) => {
    setReceiptToDelete(receipt);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!receiptToDelete) return;

    try {
      setLoading(true);

      // 1. Delete image from storage if exists
      if (receiptToDelete.image_url) {
        const imagePath = receiptToDelete.image_url.split('/').pop();
        await supabase.storage
          .from('documents')
          .remove([`${user.id}/${imagePath}`]);
      }

      // 2. Delete receipt record
      const { error } = await supabase
        .from('receipts')
        .delete()
        .eq('id', receiptToDelete.id);

      if (error) throw error;

      // 3. Update local state
      setReceipts(prev => prev.filter(r => r.id !== receiptToDelete.id));

      toast({
        title: t('toast.success'),
        description: t('documents.receiptDeleteSuccess'),
        action: <CheckCircle2 className="text-green-500 h-5 w-5" />,
      });

    } catch (error) {
      console.error('Error deleting receipt:', error);
      toast({
        variant: "destructive",
        title: t('toast.error'),
        description: t('documents.deleteError'),
        action: <AlertTriangle className="h-5 w-5" />,
      });
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
      setReceiptToDelete(null);
    }
  };

  const handleDownload = async (receipt) => {
    try {
      const response = await fetch(receipt.image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${receipt.merchant_name}-${receipt.date}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast({
        variant: "destructive",
        title: t('toast.error'),
        description: t('documents.downloadError'),
        action: <AlertTriangle className="h-5 w-5" />,
      });
    }
  };

  const filteredReceipts = receipts.filter(receipt => {
    const matchesSearch = receipt.merchant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         receipt.amount.toString().includes(searchQuery);
    const matchesCategory = selectedCategory === 'all' || receipt.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 pb-20">
      <motion.h1 
        className="text-3xl font-bold text-primary text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {t('digitalReceipts')}
      </motion.h1>

      <motion.div 
        className="flex flex-col sm:flex-row gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Button 
          onClick={() => setShowUploadDialog(true)}
          className="w-full sm:w-auto flex-1 bg-payper-blue-default hover:bg-payper-blue-dark text-lg py-6"
          disabled={loading}
        >
          <UploadCloud className="mr-2 h-6 w-6" /> {t('uploadReceipt')}
        </Button>
        <div className="flex-1 relative">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchReceipts')}
            className="w-full p-3 pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder={t('filter')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('documents.allCategories')}</SelectItem>
            <SelectItem value="groceries">{t('groceries')}</SelectItem>
            <SelectItem value="fuel">{t('fuel')}</SelectItem>
            <SelectItem value="health">{t('health')}</SelectItem>
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
        ) : filteredReceipts.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredReceipts.map((receipt) => (
              <DocumentViewer
                key={receipt.id}
                document={receipt}
                type="receipt"
                onEdit={() => {}} // To be implemented
                onDelete={() => initiateDelete(receipt)}
                onDownload={() => handleDownload(receipt)}
              />
            ))}
          </motion.div>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-muted-foreground text-center py-12"
          >
            {t('noReceiptsFound')}
          </motion.p>
        )}
      </AnimatePresence>

      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t('uploadReceipt')}</DialogTitle>
            <DialogDescription>
              {t('documents.uploadDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <ImageUploader
              onImageCapture={handleImageCapture}
              className="mb-6"
            />

            <div className="space-y-4">
              <div>
                <Label htmlFor="merchantName">{t('documents.merchantName')} *</Label>
                <Input
                  id="merchantName"
                  value={uploadData.merchantName}
                  onChange={(e) => setUploadData(prev => ({ ...prev, merchantName: e.target.value }))}
                  placeholder={t('documents.merchantNamePlaceholder')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">{t('amount')} *</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={uploadData.amount}
                    onChange={(e) => setUploadData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="date">{t('documents.receiptDate')} *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={uploadData.date}
                    onChange={(e) => setUploadData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="category">{t('documents.category')}</Label>
                <Select
                  value={uploadData.category}
                  onValueChange={(value) => setUploadData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('documents.selectCategory')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="groceries">{t('groceries')}</SelectItem>
                    <SelectItem value="fuel">{t('fuel')}</SelectItem>
                    <SelectItem value="health">{t('health')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUploadDialog(false)}
              disabled={loading}
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={handleUpload}
              disabled={loading}
              className="bg-payper-green-default hover:bg-payper-green-dark"
            >
              {loading ? t('documents.uploading') : t('documents.upload')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('documents.confirmDeleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('documents.confirmDeleteDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {loading ? t('documents.deleting') : t('documents.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ReceiptsPage;
  