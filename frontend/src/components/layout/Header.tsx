"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Search, Menu, X, User, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();

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
                        <div className="hidden sm:block h-8 w-px bg-gray-200" />
                        <span className="hidden sm:block text-lg font-bold text-primary"></span>
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

                        {isAuthenticated && user ? (
                            /* User Menu - Desktop */
                            <div className="hidden md:block relative">
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                                        {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">
                                        {user.firstName} {user.lastName}
                                    </span>
                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                </button>

                                {userMenuOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setUserMenuOpen(false)}
                                        />
                                        <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20">
                                            <Link
                                                href="/dashboard"
                                                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                <LayoutDashboard className="w-4 h-4" />
                                                <span>لوحة التحكم</span>
                                            </Link>
                                            <Link
                                                href="/profile"
                                                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                <User className="w-4 h-4" />
                                                <span>الملف الشخصي</span>
                                            </Link>
                                            <hr className="my-2" />
                                            <button
                                                onClick={() => {
                                                    logout();
                                                    setUserMenuOpen(false);
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span>تسجيل الخروج</span>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            /* Login Buttons - Desktop */
                            <>
                                <Link href="/login" className="hidden md:block">
                                    <Button variant="outline" size="sm">
                                        تسجيل الدخول
                                    </Button>
                                </Link>
                                <Link href="/programs" className="hidden md:block">
                                    <Button size="sm">ابدأ التعلم</Button>
                                </Link>
                            </>
                        )}

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

                            {isAuthenticated && user ? (
                                /* User Menu - Mobile */
                                <div className="flex flex-col gap-2 pt-4 border-t">
                                    <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
                                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                                            <p className="text-sm text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                    <Link href="/dashboard">
                                        <Button variant="outline" className="w-full justify-start gap-2">
                                            <LayoutDashboard className="w-4 h-4" />
                                            لوحة التحكم
                                        </Button>
                                    </Link>
                                    <Link href="/profile">
                                        <Button variant="outline" className="w-full justify-start gap-2">
                                            <User className="w-4 h-4" />
                                            الملف الشخصي
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={logout}
                                    >
                                        <LogOut className="w-4 h-4" />
                                        تسجيل الخروج
                                    </Button>
                                </div>
                            ) : (
                                /* Login Buttons - Mobile */
                                <div className="flex flex-col gap-2 pt-4">
                                    <Link href="/login">
                                        <Button variant="outline" className="w-full">
                                            تسجيل الدخول
                                        </Button>
                                    </Link>
                                    <Link href="/programs">
                                        <Button className="w-full">ابدأ التعلم</Button>
                                    </Link>
                                </div>
                            )}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}
