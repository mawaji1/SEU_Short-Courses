'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Twitter, Youtube, Linkedin, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

interface PublicFooterProps {
  locale?: 'ar' | 'en';
}

export function PublicFooter({ locale = 'ar' }: PublicFooterProps) {
  const currentYear = new Date().getFullYear();

  const sections = [
    {
      title: locale === 'ar' ? 'تخصصات التدريب' : 'Training Fields',
      items: [
        { label: locale === 'ar' ? 'الإدارة والقيادة المؤسسية' : 'Corporate Leadership', href: '#' },
        { label: locale === 'ar' ? 'تحول الأعمال والتقنية' : 'Business Transformation', href: '#' },
        { label: locale === 'ar' ? 'الشهادات المهنية المعتمدة' : 'Certified Programs', href: '#' },
      ]
    },
    {
      title: locale === 'ar' ? 'خدمات المتدربين' : 'Trainee Services',
      items: [
        { label: locale === 'ar' ? 'مركز الدعم والمساعدة' : 'Support Center', href: '#' },
        { label: locale === 'ar' ? 'دليل المسجلين' : 'Registration Guide', href: '#' },
        { label: locale === 'ar' ? 'البوابة الإلكترونية' : 'Digital Portal', href: '#' },
      ]
    },
    {
      title: locale === 'ar' ? 'عن المركز' : 'About Center',
      items: [
        { label: locale === 'ar' ? 'بوابة الجامعة' : 'University Portal', href: '#' },
        { label: locale === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy', href: '#' },
        { label: locale === 'ar' ? 'الشروط والأحكام' : 'Terms & Conditions', href: '#' },
      ]
    }
  ];

  return (
    <footer className="bg-slate-50 border-t pt-24 pb-12 overflow-hidden bg-subtle-mesh">
      <div className="container max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 mb-24">

          <div className="lg:col-span-5 space-y-10">
            <Image
              src="/images/seu-header-logo.svg"
              alt="SEU"
              width={200}
              height={80}
              className="h-16 w-auto grayscale opacity-90 transition-all hover:grayscale-0"
            />

            <p className="text-slate-600 font-bold leading-relaxed max-w-sm text-lg italic border-s-4 border-primary/20 ps-6">
              {locale === 'ar'
                ? 'التعليم التنفيذي والتطوير المهني - الجامعة السعودية الإلكترونية.'
                : 'SEU Professional Training Center - Your strategic partner in the journey of sustainable professional growth.'
              }
            </p>

            <div className="flex gap-5">
              {[Twitter, Youtube, Linkedin].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="h-14 w-14 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-primary hover:border-primary hover:shadow-lg transition-prestige"
                >
                  <Icon className="h-6 w-6" />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {sections.map((section, i) => (
                <div key={i} className="space-y-8">
                  <h3 className="text-slate-900 font-bold text-lg tracking-wide uppercase border-b-2 border-primary/10 pb-4">
                    {section.title}
                  </h3>
                  <ul className="space-y-5">
                    {section.items.map((item, j) => (
                      <li key={j}>
                        <Link
                          href={item.href}
                          className="footer-link-large text-slate-600 hover:text-primary transition-prestige flex items-center gap-2 group"
                        >
                          {item.label}
                          <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4 text-sm font-bold text-slate-500 uppercase tracking-widest">
            <span>© {currentYear} Saudi Electronic University</span>
            <span className="hidden md:block h-1 w-1 rounded-full bg-slate-300" />
            <span className="hidden md:block">Strategic Education</span>
          </div>
          <div className="flex items-center gap-10">
            <Link href="#" className="text-slate-500 hover:text-primary text-sm font-bold transition-colors">Accessibility</Link>
            <Link href="#" className="text-slate-500 hover:text-primary text-sm font-bold transition-colors">Digital Ethics</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default PublicFooter;
