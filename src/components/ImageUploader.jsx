
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Camera, Upload, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import Webcam from 'react-webcam';

const ImageUploader = ({ onImageCapture, className }) => {
  const { t } = useTranslation();
  const [showCamera, setShowCamera] = useState(false);
  const [preview, setPreview] = useState(null);
  const webcamRef = React.useRef(null);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onImageCapture(file);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageCapture]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.heic', '.heif']
    },
    maxSize: 5242880, // 5MB
    multiple: false
  });

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      // Convert base64 to blob
      fetch(imageSrc)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
          setPreview(imageSrc);
          onImageCapture(file);
          setShowCamera(false);
        });
    }
  }, [onImageCapture]);

  const clearImage = () => {
    setPreview(null);
    onImageCapture(null);
  };

  return (
    <div className={cn("w-full", className)}>
      <AnimatePresence mode="wait">
        {showCamera ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative"
          >
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full rounded-lg"
            />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
              <Button
                onClick={() => setShowCamera(false)}
                variant="destructive"
                size="lg"
                className="rounded-full"
              >
                <X className="w-6 h-6" />
              </Button>
              <Button
                onClick={capture}
                variant="default"
                size="lg"
                className="rounded-full bg-payper-green-default hover:bg-payper-green-dark"
              >
                <Camera className="w-6 h-6" />
              </Button>
            </div>
          </motion.div>
        ) : preview ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative"
          >
            <img
              src={preview}
              alt="Preview"
              className="w-full h-auto rounded-lg shadow-lg"
            />
            <Button
              onClick={clearImage}
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-4"
          >
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-accent"
              )}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium">{t('documents.dragAndDrop')}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {t('documents.orClickToUpload')}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {t('documents.maxFileSize')}
              </p>
            </div>
            <Button
              onClick={() => setShowCamera(true)}
              variant="outline"
              className="w-full py-6 text-lg"
            >
              <Camera className="w-6 h-6 mr-2" />
              {t('documents.useCamera')}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageUploader;
  