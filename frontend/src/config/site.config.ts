/**
 * SEU Short Courses Platform — Site Configuration
 * 
 * Centralized configuration for all platform settings.
 * Change values here to update across the entire application.
 */

export const siteConfig = {
    // ============================================================================
    // BRANDING
    // ============================================================================
    name: {
        ar: 'الدورات القصيرة',
        en: 'Short Courses',
    },

    organization: {
        ar: 'الجامعة السعودية الإلكترونية',
        en: 'Saudi Electronic University',
    },

    shortName: 'SEU',

    tagline: {
        ar: 'تطوير مهني مستمر',
        en: 'Continuous Professional Development',
    },

    description: {
        ar: 'منصة التسجيل والإدارة للدورات القصيرة في الجامعة السعودية الإلكترونية',
        en: 'Registration & Management Platform for Short Courses at SEU',
    },

    // ============================================================================
    // URLS & LINKS
    // ============================================================================
    urls: {
        home: '/',
        programs: '/programs',
        login: '/login',
        register: '/register',
        admin: '/admin',
        mainSite: 'https://seu.edu.sa',
    },

    // ============================================================================
    // CONTACT
    // ============================================================================
    contact: {
        email: 'shortcourses@seu.edu.sa',
        phone: '+966 11 XXX XXXX',
        whatsapp: '+966 5X XXX XXXX',
    },

    // ============================================================================
    // SOCIAL MEDIA
    // ============================================================================
    social: {
        twitter: 'https://twitter.com/SEU_KSA',
        linkedin: 'https://linkedin.com/school/seu-ksa',
        youtube: 'https://youtube.com/@SEU_KSA',
    },

    // ============================================================================
    // FEATURES
    // ============================================================================
    features: {
        enableBNPL: true,           // Tabby/Tamara
        enableCorporate: false,     // B2B features (Phase 2)
        enableCertificates: true,
        defaultLocale: 'ar' as const,
        supportedLocales: ['ar', 'en'] as const,
    },

    // ============================================================================
    // ASSETS
    // ============================================================================
    assets: {
        logo: '/images/seu-logo.svg',
        logoLight: '/images/seu-logo-light.svg',
        favicon: '/favicon.ico',
        ogImage: '/images/og-image.jpg',
    },
} as const;

export type SiteConfig = typeof siteConfig;
export type Locale = typeof siteConfig.features.supportedLocales[number];

/**
 * Get localized text from config
 */
export function getLocalizedText<T extends { ar: string; en: string }>(
    obj: T,
    locale: Locale = 'ar'
): string {
    return obj[locale];
}

/**
 * Get full platform name
 */
export function getPlatformName(locale: Locale = 'ar'): string {
    return `${getLocalizedText(siteConfig.name, locale)} - ${getLocalizedText(siteConfig.organization, locale)}`;
}

export default siteConfig;
