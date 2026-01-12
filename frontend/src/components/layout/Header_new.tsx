"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Search, Menu, X } from "lucide-react";
import { useState } from "react";

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="w-full border-b bg-white shadow-sm">
            <div className="container mx-auto px-6 lg:px-12 max-w-[1400px]">
                <div className="flex h-20 items-center justify-between gap-8">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3">
                        <Image
                            src="/images/seu-header-logo.svg"
                            alt="SEU"
                            width={120}
                            height={50}
                            className="h-12 w-auto"
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link
                            href="/programs"
                            className="text-base font-medium text-gray-700 hover:text-accent transition-colors"
                        >
                            البرامج التدريبية
                        </Link>
                        <Link
                            href="/trainers"
                            className="text-base font-medium text-gray-700 hover:text-accent transition-colors"
                        >
                            المدربون
                        </Link>
                        <Link
                            href="/about"
                            className="text-base font-medium text-gray-700 hover:text-accent transition-colors"
                        >
                            عن المنصة
                        </Link>
                        <Link
                            href="/support"
                            className="text-base font-medium text-gray-700 hover:text-accent transition-colors"
                        >
                            الدعم
                        </Link>
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <button className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors">
                            <Search className="w-5 h-5 text-gray-700" />
                        </button>
                        <Link href="/auth/login" className="hidden md:block">
                            <Button variant="outline" size="sm">
                                تسجيل الدخول
                            </Button>
                        </Link>
                        <Link href="/programs" className="hidden md:block">
                            <Button size="sm">ابدأ التعلم</Button>
                        </Link>

                        {/* Mobile menu button */}
                        <button
                            className="md:hidden flex items-center justify-center w-10 h-10"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t">
                        <nav className="flex flex-col gap-4">
                            <Link
                                href="/programs"
                                className="text-base font-medium text-gray-700 hover:text-accent transition-colors py-2"
                            >
                                البرامج التدريبية
                            </Link>
                            <Link
                                href="/trainers"
                                className="text-base font-medium text-gray-700 hover:text-accent transition-colors py-2"
                            >
                                المدربون
                            </Link>
                            <Link
                                href="/about"
                                className="text-base font-medium text-gray-700 hover:text-accent transition-colors py-2"
                            >
                                عن المنصة
                            </Link>
                            <Link
                                href="/support"
                                className="text-base font-medium text-gray-700 hover:text-accent transition-colors py-2"
                            >
                                الدعم
                            </Link>
                            <div className="flex flex-col gap-2 pt-4">
                                <Link href="/auth/login">
                                    <Button variant="outline" className="w-full">
                                        تسجيل الدخول
                                    </Button>
                                </Link>
                                <Link href="/programs">
                                    <Button className="w-full">ابدأ التعلم</Button>
                                </Link>
                            </div>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}
