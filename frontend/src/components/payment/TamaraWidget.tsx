'use client';

import { useEffect } from 'react';

interface TamaraWidgetProps {
  price: number;
  currency?: string;
  language?: string;
  widgetType?: 'product-widget' | 'cart-widget' | 'checkout-widget';
}

/**
 * Tamara Widget Component
 * Shows Tamara payment options on product, cart, and checkout pages
 * 
 * PRODUCTION-READY:
 * - Dynamic price updates
 * - Language support (Arabic/English)
 * - Multiple widget types
 * - Official Tamara branding
 */
export function TamaraWidget({
  price,
  currency = 'SAR',
  language = 'ar',
  widgetType = 'product-widget',
}: TamaraWidgetProps) {
  useEffect(() => {
    // Check if script already loaded
    const existingScript = document.querySelector('script[src*="tamara"]');
    
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://cdn.tamara.co/widget-v2/tamara-widget.js';
      script.async = true;
      script.onload = () => {
        setTimeout(() => initializeTamaraWidget(), 100);
      };
      document.head.appendChild(script);
    } else {
      // Script already loaded, just initialize
      setTimeout(() => initializeTamaraWidget(), 100);
    }
  }, []);

  useEffect(() => {
    // Reinitialize when price changes
    initializeTamaraWidget();
  }, [price, currency, language, widgetType]);

  const initializeTamaraWidget = () => {
    if (typeof window === 'undefined') return;

    const publicKey = process.env.NEXT_PUBLIC_TAMARA_PUBLIC_KEY;

    // Tamara widget configuration
    (window as any).tamaraWidgetConfig = {
      lang: language,
      country: 'SA',
      publicKey: publicKey,
      amount: price,
      currency: currency,
    };

    // Trigger widget render if Tamara object exists
    if ((window as any).TamaraWidgetV2) {
      try {
        (window as any).TamaraWidgetV2.refresh();
      } catch (e) {
        console.error('Tamara widget error:', e);
      }
    }
  };

  return (
    <div className="my-4" style={{ minHeight: '60px' }}>
      <div 
        id="tamara-widget-container"
        data-tamara-widget
        data-type={widgetType}
        data-amount={price.toString()}
        data-currency={currency}
        data-country-code="SA"
        data-language={language}
      />
    </div>
  );
}
