
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import performOCR from '@/lib/ocrService';
import { supabase } from '@/lib/supabaseClient';
import { format } from 'date-fns';

export default function FileUploadDialog({ open, onOpenChange, onSuccess, type = 'receipt' }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrData, setOcrData] = useState(null);
  const [formData, setFormData] = useState({
    merchantName: '',
    amount: '',
    date: '',
    category: '',
  });

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
      processFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.heic'],
    },
    maxFiles: 1,
    maxSize: 10485760, // 10MB
  });

  const processFile = async (file) => {
    setIsProcessing(true);
    try {
      const ocrResult = await performOCR(file);
      setOcrData(ocrResult);
      setFormData({
        merchantName: ocrResult.merchantName || '',
        amount: ocrResult.amount?.toString() || '',
        date: ocrResult.date || format(new Date(), 'yyyy-MM-dd'),
        category: '',
      });
      
      toast({
        title: t('upload.ocrSuccess'),
        description: t('upload.ocrDataExtracted'),
      });
    } catch (error) {
      console.error('OCR Error:', error);
      toast({
        variant: "destructive",
        title: t('upload.ocrError'),
        description: t('upload.tryManualInput'),
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    try {
      // Upload image to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${type}s/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(filePath);

      // Save record to database
      const { data, error } = await supabase
        .from(type === 'receipt' ? 'receipts' : 'invoices')
        .insert([{
          merchant_name: formData.merchantName,
          amount: parseFloat(formData.amount),
          date: formData.date,
          category: formData.category,
          image_url: publicUrl,
          ocr_data: ocrData,
          status: 'processed',
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: t('upload.success'),
        description: t(`upload.${type}Uploaded`),
      });

      onSuccess?.(data);
      onOpenChange(false);
    } catch (error) {
      console.error('Upload Error:', error);
      toast({
        variant: "destructive",
        title: t('upload.error'),
        description: error.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t(`upload.${type}Title`)}</DialogTitle>
          <DialogDescription>{t(`upload.${type}Description`)}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {!file ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                {isDragActive ? t('upload.dropHere') : t('upload.dragAndDrop')}
              </p>
            </div>
          ) : (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-40 object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => {
                  setFile(null);
                  setPreview('');
                  setOcrData(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <AnimatePresence>
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center space-x-2 text-sm text-muted-foreground"
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t('upload.processing')}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {(file || ocrData) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="merchantName">{t('upload.merchantName')}</Label>
                <Input
                  id="merchantName"
                  value={formData.merchantName}
                  onChange={(e) => setFormData({ ...formData, merchantName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">{t('upload.amount')}</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">{t('upload.date')}</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">{t('upload.category')}</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder={t('upload.categoryPlaceholder')}
                />
              </div>
            </motion.div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            {t('cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!file || isProcessing || !formData.merchantName || !formData.amount}
          >
            {isProcessing ? t('upload.processing') : t('upload.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
  