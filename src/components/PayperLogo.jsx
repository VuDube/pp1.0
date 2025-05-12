
import React from 'react';

const PayperLogo = ({ className = '', size = 'md' }) => {
  const logoUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/153079ed-dce2-42a5-9072-a2f7ca096188/4374556394d715000fb089c128b01903.jpg";
  
  let widthClass = 'w-28'; 
  if (size === 'sm') {
    widthClass = 'w-20';
  } else if (size === 'lg') {
    widthClass = 'w-36';
  }

  return (
    <div className={`flex items-center ${className}`}>
      <img src={logoUrl} alt="PAYPER Logo" className={`${widthClass} h-auto`} />
    </div>
  );
};

export default PayperLogo;
  