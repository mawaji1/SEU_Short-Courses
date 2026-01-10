"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Trash2, Eye, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const mockPrograms = [
    { id: 1, title: "أساسيات الذكاء الاصطناعي", category: "التقنية", instructor: "د. أحمد المالكي", price: 1800, students: 45, status: "نشط" },
    { id: 2, title: "إدارة المشاريع الاحترافية PMP", category: "الإدارة", instructor: "أ. سارة العبدالله", price: 2500, students: 32, status: "نشط" },
    { id: 3, title: "التسويق الرقمي المتقدم", category: "التسويق", instructor: "أ. نورة الحربي", price: 1500, students: 28, status: "قريباً" },
    { id: 4, title: "تحليل البيانات باستخدام Python", category: "التقنية", instructor: "م. خالد الشهري", price: 1800, students: 56, status: "نشط" },
    { id: 5, title: "القيادة والذكاء العاطفي", category: "التطوير الذاتي", instructor: "د. فهد الغامدي", price: 1200, students: 41, status: "نشط" },
    { id: 6, title: "الأمن السيبراني", category: "التقنية", instructor: "د. عبدالله الدوسري", price: 2200, students: 0, status: "مسودة" },
];

export default function AdminProgramsPage() {
    const [programs, setPrograms] = useState(mockPrograms);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<string | null>(null);

    const filteredPrograms = programs.filter((prog) => {
        const matchesSearch = prog.title.includes(searchQuery) || prog.instructor.includes(searchQuery);
        const matchesStatus = !filterStatus || prog.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const handleDelete = (id: number) => {
        if (confirm("هل أنت متأكد من حذف هذا البرنامج؟")) {
            setPrograms(programs.filter((prog) => prog.id !== id));
        }
    };

    const statusCounts = {
        all: programs.length,
        "نشط": programs.filter(p => p.status === "نشط").length,
        "قريباً": programs.filter(p => p.status === "قريباً").length,
        "مسودة": programs.filter(p => p.status === "مسودة").length,
    };

    return (
        <div className="max-w-[1400px] mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">البرامج التدريبية</h1>
                    <p className="text-gray-600">إدارة جميع البرامج والدورات التدريبية</p>
                </div>
                <Button className="gap-2">
                    <Plus className="w-5 h-5" />
                    إضافة برنامج
                </Button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="البحث في البرامج..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-12 pr-12 pl-4 rounded-xl border border-gray-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilterStatus(null)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${!filterStatus ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            الكل ({statusCounts.all})
                        </button>
                        <button
                            onClick={() => setFilterStatus("نشط")}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === "نشط" ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200'
                                }`}
                        >
                            نشط ({statusCounts["نشط"]})
                        </button>
                        <button
                            onClick={() => setFilterStatus("قريباً")}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === "قريباً" ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                }`}
                        >
                            قريباً ({statusCounts["قريباً"]})
                        </button>
                        <button
                            onClick={() => setFilterStatus("مسودة")}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === "مسودة" ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            مسودة ({statusCounts["مسودة"]})
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">البرنامج</th>
                                <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">التصنيف</th>
                                <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">المدرب</th>
                                <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">السعر</th>
                                <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">المتدربون</th>
                                <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">الحالة</th>
                                <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPrograms.map((program) => (
                                <tr key={program.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{program.title}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-accent font-medium">{program.category}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-600">{program.instructor}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-bold text-gray-900">{program.price.toLocaleString()} ر.س</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-900">{program.students}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${program.status === 'نشط' ? 'bg-green-100 text-green-700' :
                                                program.status === 'قريباً' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-gray-100 text-gray-600'
                                            }`}>
                                            {program.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Link href={`/programs/${program.id}`}>
                                                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </Link>
                                            <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(program.id)}
                                                className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
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
