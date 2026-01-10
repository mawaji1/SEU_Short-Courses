'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Search, Globe, User, Menu } from 'lucide-react';

interface PublicHeaderProps {
  locale?: 'ar' | 'en';
}

export function PublicHeader({ locale = 'ar' }: PublicHeaderProps) {
  const links = [
    { label: locale === 'ar' ? 'الدورات التدريبية' : 'Training Courses', href: '/programs' },
    { label: locale === 'ar' ? 'المدربون الخبراء' : 'Expert Trainers', href: '/trainers' },
    { label: locale === 'ar' ? 'الأسئلة الشائعة' : 'FAQ', href: '/faq' },
    { label: locale === 'ar' ? 'تواصل معنا' : 'Contact Us', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md shadow-sm">
      <div className="container flex h-24 md:h-28 max-w-7xl items-center justify-between mx-auto px-6">
        {/* Brand Section */}
        <Link href="/" className="flex items-center gap-6 group scale-110 origin-left rtl:origin-right">
          <Image
            src="/images/seu-header-logo.svg"
            alt="Saudi Electronic University"
            width={180}
            height={70}
            className="h-16 w-auto"
            priority
          />
          <div className="h-10 w-px bg-slate-200 hidden md:block" />
          <div className="hidden md:block">
            <span className="text-lg font-bold text-slate-900 block leading-tight">
              {locale === 'ar' ? 'التدريب الاحترافي' : 'Professional Training'}
            </span>
            <span className="text-xs font-bold text-primary uppercase tracking-[0.1em]">
              Executive Education Center
            </span>
          </div>
        </Link>

        {/* Navigation - Large Fonts */}
        <nav className="hidden lg:flex items-center gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-6 py-3 nav-link-large text-slate-700 hover:text-primary transition-prestige hover:bg-slate-50 rounded-lg"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden xl:flex items-center gap-2 border-e pe-6 me-2 border-slate-100">
            <Button variant="ghost" size="icon" className="h-12 w-12 text-slate-400">
              <Search className="h-6 w-6" />
            </Button>
            <Button variant="ghost" className="h-12 font-bold text-lg text-slate-500 gap-2 px-4 hover:bg-slate-50">
              <Globe className="h-5 w-5" />
              <span>{locale === 'ar' ? 'English' : 'عربي'}</span>
            </Button>
          </div>

          <Button variant="ghost" size="lg" asChild className="hidden md:flex text-lg font-bold text-slate-700 hover:text-primary">
            <Link href="/auth/login">
              {locale === 'ar' ? 'دخول' : 'Login'}
            </Link>
          </Button>

          <Button asChild size="lg" className="bg-primary text-white hover:bg-primary/90 font-bold px-8 py-7 text-lg shadow-lg shadow-primary/20 border-b-4 border-primary/20 transition-all hover:-translate-y-0.5 active:translate-y-0 rounded-xl">
            <Link href="/auth/register">
              {locale === 'ar' ? 'ابدأ الآن' : 'Get Started'}
            </Link>
          </Button>

          <Button variant="ghost" size="icon" className="lg:hidden text-slate-700 scale-125">
            <Menu className="h-8 w-8" />
          </Button>
        </div>
      </div>
    </header>
  );
}

export default PublicHeader;
