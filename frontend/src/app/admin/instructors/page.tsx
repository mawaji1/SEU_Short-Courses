"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Trash2, X } from "lucide-react";
import { motion } from "framer-motion";

const mockInstructors = [
    { id: 1, name: "د. أحمد محمد المالكي", title: "أستاذ مشارك في علوم الحاسب", email: "ahmed@seu.edu.sa", programs: 3, isActive: true },
    { id: 2, name: "أ. سارة العبدالله", title: "خبيرة في إدارة المشاريع", email: "sarah@seu.edu.sa", programs: 2, isActive: true },
    { id: 3, name: "د. فهد الغامدي", title: "أستاذ في إدارة الأعمال", email: "fahad@seu.edu.sa", programs: 2, isActive: true },
    { id: 4, name: "م. خالد الشهري", title: "مهندس بيانات", email: "khaled@seu.edu.sa", programs: 1, isActive: true },
    { id: 5, name: "أ. نورة الحربي", title: "خبيرة تسويق رقمي", email: "noura@seu.edu.sa", programs: 1, isActive: false },
];

export default function InstructorsPage() {
    const [instructors, setInstructors] = useState(mockInstructors);
    const [searchQuery, setSearchQuery] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingInstructor, setEditingInstructor] = useState<typeof mockInstructors[0] | null>(null);

    const filteredInstructors = instructors.filter((inst) =>
        inst.name.includes(searchQuery) || inst.email.includes(searchQuery)
    );

    const handleDelete = (id: number) => {
        if (confirm("هل أنت متأكد من حذف هذا المدرب؟")) {
            setInstructors(instructors.filter((inst) => inst.id !== id));
        }
    };

    return (
        <div className="max-w-[1200px] mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">المدربون</h1>
                    <p className="text-gray-600">إدارة المدربين والخبراء</p>
                </div>
                <Button className="gap-2" onClick={() => { setEditingInstructor(null); setShowModal(true); }}>
                    <Plus className="w-5 h-5" />
                    إضافة مدرب
                </Button>
            </div>

            {/* Search */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
                <div className="relative">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="البحث بالاسم أو البريد الإلكتروني..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-12 pr-12 pl-4 rounded-xl border border-gray-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
                    />
                </div>
            </div>

            {/* Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
            >
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">المدرب</th>
                            <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">البريد الإلكتروني</th>
                            <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">البرامج</th>
                            <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">الحالة</th>
                            <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInstructors.map((instructor) => (
                            <tr key={instructor.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                                            {instructor.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{instructor.name}</div>
                                            <div className="text-sm text-gray-500">{instructor.title}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-gray-600">{instructor.email}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-gray-900">{instructor.programs}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${instructor.isActive
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {instructor.isActive ? 'نشط' : 'غير نشط'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => { setEditingInstructor(instructor); setShowModal(true); }}
                                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(instructor.id)}
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
            </motion.div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl w-full max-w-md p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingInstructor ? 'تعديل المدرب' : 'إضافة مدرب جديد'}
                            </h2>
                            <button onClick={() => setShowModal(false)}>
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">الاسم الكامل</label>
                                <input
                                    type="text"
                                    defaultValue={editingInstructor?.name}
                                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
                                    placeholder="د. أحمد محمد"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">المسمى الوظيفي</label>
                                <input
                                    type="text"
                                    defaultValue={editingInstructor?.title}
                                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
                                    placeholder="أستاذ مشارك في..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">البريد الإلكتروني</label>
                                <input
                                    type="email"
                                    defaultValue={editingInstructor?.email}
                                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
                                    placeholder="email@seu.edu.sa"
                                    dir="ltr"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <input type="checkbox" id="isActive" defaultChecked={editingInstructor?.isActive ?? true} className="accent-accent" />
                                <label htmlFor="isActive" className="text-sm text-gray-700">نشط</label>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                                    إلغاء
                                </Button>
                                <Button type="submit" className="flex-1">
                                    {editingInstructor ? 'حفظ التغييرات' : 'إضافة'}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
