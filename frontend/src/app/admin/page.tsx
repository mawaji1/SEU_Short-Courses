"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    BookOpen,
    Users,
    FolderOpen,
    TrendingUp,
    ArrowLeft,
    Plus,
} from "lucide-react";
import { motion } from "framer-motion";

const stats = [
    {
        title: "إجمالي البرامج",
        value: "24",
        change: "+3 هذا الشهر",
        icon: BookOpen,
        color: "bg-accent/10 text-accent",
        href: "/admin/programs",
    },
    {
        title: "المدربون النشطون",
        value: "18",
        change: "+2 جدد",
        icon: Users,
        color: "bg-blue-100 text-blue-600",
        href: "/admin/instructors",
    },
    {
        title: "التصنيفات",
        value: "8",
        icon: FolderOpen,
        color: "bg-purple-100 text-purple-600",
        href: "/admin/categories",
    },
    {
        title: "المتدربون المسجلون",
        value: "1,245",
        change: "+156 هذا الشهر",
        icon: TrendingUp,
        color: "bg-green-100 text-green-600",
        href: "/admin",
    },
];

const recentPrograms = [
    { id: 1, title: "أساسيات الذكاء الاصطناعي", category: "التقنية", students: 45, status: "نشط" },
    { id: 2, title: "إدارة المشاريع الاحترافية", category: "الإدارة", students: 32, status: "نشط" },
    { id: 3, title: "التسويق الرقمي", category: "التسويق", students: 28, status: "قريباً" },
];

export default function AdminDashboard() {
    return (
        <div className="max-w-[1400px] mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">لوحة التحكم</h1>
                    <p className="text-gray-600">مرحباً بك في لوحة إدارة التدريب الاحترافي</p>
                </div>
                <Link href="/admin/programs">
                    <Button className="gap-2">
                        <Plus className="w-5 h-5" />
                        إضافة برنامج
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Link href={stat.href}>
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                    <ArrowLeft className="w-5 h-5 text-gray-400" />
                                </div>
                                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                                <div className="text-sm text-gray-600">{stat.title}</div>
                                {stat.change && (
                                    <div className="text-xs text-accent mt-2">{stat.change}</div>
                                )}
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* Recent Programs Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
            >
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">أحدث البرامج</h2>
                    <Link href="/admin/programs">
                        <Button variant="outline" size="sm" className="gap-2">
                            عرض الكل
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">البرنامج</th>
                                <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">التصنيف</th>
                                <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">المتدربون</th>
                                <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">الحالة</th>
                                <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentPrograms.map((program) => (
                                <tr key={program.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{program.title}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-600">{program.category}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-900">{program.students}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${program.status === 'نشط'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {program.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link href={`/admin/programs/${program.id}`}>
                                            <Button variant="ghost" size="sm">تعديل</Button>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}
