import Link from "next/link";
import Image from "next/image";
import { Instagram, Linkedin, Youtube } from "lucide-react";

// X (formerly Twitter) icon
function XIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    );
}

export function Footer() {
    return (
        <footer className="bg-primary text-white mt-auto">
            <div className="container mx-auto px-6 lg:px-12 max-w-[1400px] py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div>
                        <Image
                            src="/images/seu-header-logo.svg"
                            alt="SEU"
                            width={120}
                            height={50}
                            className="h-12 w-auto brightness-0 invert mb-4"
                        />
                        <p className="text-gray-300 text-sm leading-relaxed">
                            معهد البحوث والدراسات الاستشارية - الجامعة السعودية الإلكترونية
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-bold mb-4">روابط سريعة</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/programs" className="text-gray-300 hover:text-accent transition-colors">
                                    تصفح البرامج
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-gray-300 hover:text-accent transition-colors">
                                    عن المنصة
                                </Link>
                            </li>
                            <li>
                                <Link href="/faq" className="text-gray-300 hover:text-accent transition-colors">
                                    الأسئلة الشائعة
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-gray-300 hover:text-accent transition-colors">
                                    تواصل معنا
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* For Trainees */}
                    <div>
                        <h3 className="text-lg font-bold mb-4">للمتدربين</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/register" className="text-gray-300 hover:text-accent transition-colors">
                                    التسجيل
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard" className="text-gray-300 hover:text-accent transition-colors">
                                    لوحة التحكم
                                </Link>
                            </li>
                            <li>
                                <Link href="/certificates" className="text-gray-300 hover:text-accent transition-colors">
                                    شهاداتي
                                </Link>
                            </li>
                            <li>
                                <Link href="/support" className="text-gray-300 hover:text-accent transition-colors">
                                    الدعم الفني
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Social Media */}
                    <div>
                        <h3 className="text-lg font-bold mb-4">تواصل معنا</h3>
                        <div className="flex gap-3">
                            <a
                                href="https://x.com/rsi_seu"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="إكس"
                                className="w-10 h-10 rounded-lg bg-white/10 hover:bg-accent transition-colors flex items-center justify-center"
                            >
                                <XIcon className="w-5 h-5" />
                                <span className="sr-only">X (formerly Twitter)</span>
                            </a>
                            <a
                                href="https://instagram.com/rsi_seu"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="انستقرام"
                                className="w-10 h-10 rounded-lg bg-white/10 hover:bg-accent transition-colors flex items-center justify-center"
                            >
                                <Instagram className="w-5 h-5" />
                                <span className="sr-only">Instagram</span>
                            </a>
                            <a
                                href="https://www.linkedin.com/company/معهد-البحوث-والدراسات-بالجامعة-السعودية-الإلكترونية/"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="لينكد إن"
                                className="w-10 h-10 rounded-lg bg-white/10 hover:bg-accent transition-colors flex items-center justify-center"
                            >
                                <Linkedin className="w-5 h-5" />
                                <span className="sr-only">LinkedIn</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-300 text-sm">
                        © 2026 معهد البحوث والدراسات الاستشارية - الجامعة السعودية الإلكترونية. جميع الحقوق محفوظة.
                    </p>
                    <div className="flex gap-6 text-sm">
                        <Link href="/terms" className="text-gray-300 hover:text-accent transition-colors">
                            الشروط والأحكام
                        </Link>
                        <Link href="/privacy" className="text-gray-300 hover:text-accent transition-colors">
                            سياسة الخصوصية
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
