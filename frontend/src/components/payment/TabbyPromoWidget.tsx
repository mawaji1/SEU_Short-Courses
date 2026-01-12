'use client';

import { useEffect } from 'react';

interface TabbyPromoWidgetProps {
  price: number;
  currency?: string;
  language?: string;
  source?: 'product' | 'cart';
}

/**
 * Tabby Promotional Widget
 * Shows "Split into 4 payments" messaging on product and cart pages
 * 
 * PRODUCTION-READY:
 * - Dynamic price updates
 * - Language support (Arabic/English)
 * - Responsive design
 * - Official Tabby branding
 */
export function TabbyPromoWidget({
  price,
  currency = 'SAR',
  language = 'ar',
  source = 'product',
}: TabbyPromoWidgetProps) {
  useEffect(() => {
    // Load Tabby promo script
    const script = document.createElement('script');
    script.src = 'https://checkout.tabby.ai/tabby-promo.js';
    script.async = true;
    
    script.onload = () => {
      initializeTabbyPromo();
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    // Reinitialize when price changes
    initializeTabbyPromo();
  }, [price, currency, language, source]);

  const initializeTabbyPromo = () => {
    if (typeof window === 'undefined' || !(window as any).TabbyPromo) return;

    try {
      new (window as any).TabbyPromo({
        selector: '#tabby-promo',
        currency: currency,
        price: price.toFixed(2),
        lang: language,
        source: source,
        publicKey: process.env.NEXT_PUBLIC_TABBY_PUBLIC_KEY,
        merchantCode: process.env.NEXT_PUBLIC_TABBY_MERCHANT_CODE,
      });
    } catch (error) {
      console.error('Failed to initialize Tabby promo:', error);
    }
  };

  return (
    <div id="tabby-promo" className="my-4"></div>
  );
}
