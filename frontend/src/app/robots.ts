import type { MetadataRoute } from 'next'

/**
 * Robots.txt generation for SEU Short Courses Platform
 *
 * - Allows crawling of all public pages
 * - Disallows protected/authenticated areas
 * - Disallows API routes
 * - References the sitemap
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://courses.seu.edu.sa'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          // Protected learner pages
          '/dashboard',
          '/dashboard/',
          '/certificates',
          '/certificates/',
          '/my-courses',
          '/my-courses/',
          '/profile',
          '/profile/',
          '/settings',
          '/settings/',
          '/messages',
          '/messages/',
          '/calendar',
          '/calendar/',
          // Auth pages
          '/login',
          '/register',
          '/forgot-password',
          '/reset-password',
          '/verify-email',
          // Admin area
          '/admin',
          '/admin/',
          // Payment pages
          '/payment',
          '/payment/',
          '/checkout',
          '/checkout/',
          // API routes
          '/api',
          '/api/',
          // Test pages
          '/test-design',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
