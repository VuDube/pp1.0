
import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log to monitoring service in production
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onReset={() => {
        this.setState({ hasError: false });
        window.location.reload();
      }} />;
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ onReset }) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <AlertTriangle className="h-16 w-16 text-destructive animate-bounce" />
          <h2 className="text-2xl font-bold text-foreground">
            {t('error.somethingWentWrong')}
          </h2>
          <p className="text-muted-foreground">
            {t('error.tryAgainMessage')}
          </p>
          <div className="flex space-x-4">
            <Button
              onClick={onReset}
              className="bg-payper-blue-default hover:bg-payper-blue-dark"
            >
              {t('error.tryAgain')}
            </Button>
            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
            >
              {t('error.backToHome')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;
