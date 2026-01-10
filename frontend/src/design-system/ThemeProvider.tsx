'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { tokens, Tokens } from './tokens';

/**
 * SEU Theme Context
 * 
 * Provides access to design tokens throughout the application.
 * The actual styling is applied via CSS custom properties in seu-theme.css
 */

interface ThemeContextValue {
    tokens: Tokens;
    direction: 'rtl' | 'ltr';
    locale: 'ar' | 'en';
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface SEUThemeProviderProps {
    children: ReactNode;
    direction?: 'rtl' | 'ltr';
    locale?: 'ar' | 'en';
}

/**
 * SEU Theme Provider
 * 
 * Wraps the application with SEU design tokens and direction context.
 * Works alongside platformscode-new-react components.
 */
export function SEUThemeProvider({
    children,
    direction = 'rtl',
    locale = 'ar',
}: SEUThemeProviderProps) {
    const value: ThemeContextValue = {
        tokens,
        direction,
        locale,
    };

    return (
        <ThemeContext.Provider value={value}>
            <div dir={direction} lang={locale} className="seu-theme-root">
                {children}
            </div>
        </ThemeContext.Provider>
    );
}

/**
 * Hook to access SEU theme context
 */
export function useSEUTheme(): ThemeContextValue {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useSEUTheme must be used within a SEUThemeProvider');
    }
    return context;
}

/**
 * Hook to get current tokens
 */
export function useTokens(): Tokens {
    const { tokens } = useSEUTheme();
    return tokens;
}

/**
 * Hook to get current direction
 */
export function useDirection(): 'rtl' | 'ltr' {
    const { direction } = useSEUTheme();
    return direction;
}

/**
 * Hook to get current locale
 */
export function useLocale(): 'ar' | 'en' {
    const { locale } = useSEUTheme();
    return locale;
}
