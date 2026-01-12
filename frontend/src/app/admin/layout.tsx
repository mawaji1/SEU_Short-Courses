"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

import {
    LayoutDashboard,
    BookOpen,
    Users,
    FolderOpen,
    Settings,
    LogOut,
    Bell,
    Menu,
    X,
    Tag,
    Award,
    GitBranch,
    Activity,
    Shield,
} from "lucide-react";

const sidebarLinks = [
    // Dashboard
    { href: "/admin", label: "لوحة التحكم", icon: LayoutDashboard },
    
    // Content Management
    { href: "/admin/programs", label: "البرامج", icon: BookOpen },
    { href: "/admin/categories", label: "التصنيفات", icon: FolderOpen },
    { href: "/admin/instructors", label: "المدربون", icon: Users },
    
    // User Management
    { href: "/admin/users", label: "المستخدمون", icon: Users },
    
    // Operations & Monitoring
    { href: "/admin/course-mapping", label: "ربط المقررات", icon: GitBranch },
    { href: "/admin/completion-monitoring", label: "متابعة الإكمال", icon: Activity },
    { href: "/admin/certificates", label: "الشهادات", icon: Award },
    
    // Marketing & Finance
    { href: "/admin/promo-codes", label: "أكواد الخصم", icon: Tag },
    
    // System & Security
    { href: "/admin/audit-logs", label: "سجل التدقيق", icon: Shield },
];

function SidebarFooter({ onClose }: { onClose: () => void }) {
    const { logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        onClose();
        router.push('/login');
    };

    return (
        <div className="p-4 border-t border-gray-100 space-y-1">
            <Link
                href="/admin/settings"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors font-medium"
            >
                <Settings className="w-5 h-5" />
                الإعدادات
            </Link>
            <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-medium"
            >
                <LogOut className="w-5 h-5" />
                تسجيل الخروج
            </button>
        </div>
    );
}

function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const pathname = usePathname();

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed top-0 right-0 h-full w-64 bg-white border-l border-gray-200 z-50
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b border-gray-100">
                        <Link href="/admin" className="flex items-center gap-3">
                            <Image
                                src="/images/seu-header-logo.svg"
                                alt="SEU"
                                width={100}
                                height={40}
                                className="h-10 w-auto"
                            />
                            <div className="text-sm font-bold text-primary">لوحة الإدارة</div>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1">
                        {sidebarLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={onClose}
                                    className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium
                    ${isActive
                                            ? 'bg-primary text-white'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }
                  `}
                                >
                                    <link.icon className="w-5 h-5" />
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <SidebarFooter onClose={onClose} />
                </div>
            </aside>
        </>
    );
}

function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const roleLabels: Record<string, string> = {
        ADMIN: 'مدير النظام',
        OPERATIONS: 'فريق العمليات',
        FINANCE: 'فريق المالية',
        COORDINATOR: 'منسق',
        LEARNER: 'متدرب',
    };

    const userInitial = user?.firstName?.charAt(0) || 'A';
    const userName = user ? `${user.firstName} ${user.lastName}` : 'مستخدم';
    const userRole = user?.role ? roleLabels[user.role] : 'مستخدم';

    return (
        <header className="fixed top-0 right-0 left-0 lg:right-64 h-16 bg-white border-b border-gray-200 z-30 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <h1 className="text-lg font-bold text-gray-900">التدريب الاحترافي - لوحة الإدارة</h1>
            </div>

            <div className="flex items-center gap-4">
                <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                    <Bell className="w-5 h-5 text-gray-600" />
                    <span className="absolute top-1 left-1 w-2 h-2 bg-red-500 rounded-full" />
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                        {userInitial}
                    </div>
                    <div className="hidden sm:block text-right">
                        <div className="text-sm font-bold text-gray-900">{userName}</div>
                        <div className="text-xs text-gray-500">{userRole}</div>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <TopBar onMenuClick={() => setSidebarOpen(true)} />
            <main className="lg:mr-64 mt-16 p-6 lg:p-8">
                {children}
            </main>
        </div>
    );
}
