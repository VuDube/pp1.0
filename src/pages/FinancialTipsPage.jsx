
import React from 'react';
import { Lightbulb, TrendingUp, ShieldCheck, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const TipCard = ({ title, description, icon, bgColor }) => (
  <motion.div 
    className={`p-6 rounded-xl shadow-lg text-white ${bgColor}`}
    whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(0,0,0,0.2)" }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex items-center mb-3">
      {React.cloneElement(icon, { className: "h-8 w-8 mr-3" })}
      <h3 className="text-xl font-semibold">{title}</h3>
    </div>
    <p className="text-sm opacity-90">{description}</p>
  </motion.div>
);

const FinancialTipsPage = () => {
  const { t } = useTranslation();
  const tips = [
    {
      title: t('budgetWisely'),
      description: t('budgetWiselyDesc'),
      icon: <TrendingUp />,
      bgColor: 'bg-payper-blue-default'
    },
    {
      title: t('saveRegularly'),
      description: t('saveRegularlyDesc'),
      icon: <ShieldCheck />,
      bgColor: 'bg-payper-green-default'
    },
    {
      title: t('understandDebt'),
      description: t('understandDebtDesc'),
      icon: <BookOpen />,
      bgColor: 'bg-yellow-500'
    },
    {
      title: t('investForFuture'),
      description: t('investForFutureDesc'),
      icon: <Lightbulb />,
      bgColor: 'bg-purple-600'
    }
  ];

  return (
    <div className="space-y-8 pb-20">
      <motion.div 
        className="text-center py-10 payper-gradient-bg rounded-xl shadow-xl"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Lightbulb className="h-16 w-16 text-white mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-white">{t('financialWellnessHub')}</h1>
        <p className="text-lg text-primary-foreground mt-2">{t('financialWellnessTagline')}</p>
      </motion.div>

      <motion.section
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.2, delayChildren: 0.3 } }
        }}
      >
        <h2 className="text-2xl font-semibold mb-6 text-primary text-center">{t('topFinancialTips')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tips.map((tip, index) => (
            <TipCard key={index} {...tip} />
          ))}
        </div>
      </motion.section>

      <motion.section 
        className="mt-10 p-6 glassmorphism-card text-foreground"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <h3 className="text-xl font-semibold mb-3 text-center">{t('needPersonalizedAdvice')}</h3>
        <p className="text-center text-sm mb-4">
          {t('personalizedAdviceDesc')}
        </p>
        <div className="text-center">
          <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-lg font-medium">
            {t('findAdvisor')}
          </button>
        </div>
      </motion.section>
    </div>
  );
};

export default FinancialTipsPage;
  