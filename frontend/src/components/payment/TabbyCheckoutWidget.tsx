'use client';

import { useEffect } from 'react';

interface TabbyCheckoutWidgetProps {
  price: number;
  currency?: string;
  language?: string;
}

/**
 * Tabby Checkout Widget
 * Shows payment details on checkout page
 * 
 * PRODUCTION-READY:
 * - Dynamic price updates
 * - Language support
 * - Responsive design
 */
export function TabbyCheckoutWidget({
  price,
  currency = 'SAR',
  language = 'ar',
}: TabbyCheckoutWidgetProps) {
  useEffect(() => {
    // Load Tabby card script
    const script = document.createElement('script');
    script.src = 'https://checkout.tabby.ai/tabby-card.js';
    script.async = true;
    
    script.onload = () => {
      initializeTabbyCard();
    };

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    initializeTabbyCard();
  }, [price, currency, language]);

  const initializeTabbyCard = () => {
    if (typeof window === 'undefined' || !(window as any).TabbyCard) return;

    try {
      new (window as any).TabbyCard({
        selector: '#tabby-card',
        currency: currency,
        lang: language,
        price: price.toFixed(2),
        size: 'narrow',
        theme: 'default',
        header: true,
        publicKey: process.env.NEXT_PUBLIC_TABBY_PUBLIC_KEY,
        merchantCode: process.env.NEXT_PUBLIC_TABBY_MERCHANT_CODE,
      });
    } catch (error) {
      console.error('Failed to initialize Tabby card:', error);
    }
  };

  return (
    <div id="tabby-card" className="my-4"></div>
  );
}
