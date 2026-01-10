"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Trash2, X } from "lucide-react";
import { motion } from "framer-motion";

const mockCategories = [
    { id: 1, name: "التقنية والمعلوماتية", slug: "technology", programsCount: 8, isActive: true },
    { id: 2, name: "إدارة الأعمال", slug: "business", programsCount: 5, isActive: true },
    { id: 3, name: "التسويق", slug: "marketing", programsCount: 4, isActive: true },
    { id: 4, name: "التطوير الذاتي", slug: "self-development", programsCount: 3, isActive: true },
    { id: 5, name: "القانون", slug: "law", programsCount: 2, isActive: false },
];

export default function CategoriesPage() {
    const [categories, setCategories] = useState(mockCategories);
    const [searchQuery, setSearchQuery] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<typeof mockCategories[0] | null>(null);

    const filteredCategories = categories.filter((cat) =>
        cat.name.includes(searchQuery)
    );

    const handleDelete = (id: number) => {
        if (confirm("هل أنت متأكد من حذف هذا التصنيف؟")) {
            setCategories(categories.filter((cat) => cat.id !== id));
        }
    };

    return (
        <div className="max-w-[1200px] mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">التصنيفات</h1>
                    <p className="text-gray-600">إدارة تصنيفات البرامج التدريبية</p>
                </div>
                <Button className="gap-2" onClick={() => { setEditingCategory(null); setShowModal(true); }}>
                    <Plus className="w-5 h-5" />
                    إضافة تصنيف
                </Button>
            </div>

            {/* Search */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
                <div className="relative">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="البحث في التصنيفات..."
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
                            <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">التصنيف</th>
                            <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">Slug</th>
                            <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">البرامج</th>
                            <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">الحالة</th>
                            <th className="text-right px-6 py-4 text-sm font-bold text-gray-900">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCategories.map((category) => (
                            <tr key={category.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{category.name}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">{category.slug}</code>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-gray-900">{category.programsCount}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${category.isActive
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {category.isActive ? 'نشط' : 'غير نشط'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => { setEditingCategory(category); setShowModal(true); }}
                                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(category.id)}
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
                                {editingCategory ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
                            </h2>
                            <button onClick={() => setShowModal(false)}>
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">اسم التصنيف</label>
                                <input
                                    type="text"
                                    defaultValue={editingCategory?.name}
                                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
                                    placeholder="مثال: التقنية"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">Slug</label>
                                <input
                                    type="text"
                                    defaultValue={editingCategory?.slug}
                                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none"
                                    placeholder="technology"
                                    dir="ltr"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <input type="checkbox" id="isActive" defaultChecked={editingCategory?.isActive ?? true} className="accent-accent" />
                                <label htmlFor="isActive" className="text-sm text-gray-700">نشط</label>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                                    إلغاء
                                </Button>
                                <Button type="submit" className="flex-1">
                                    {editingCategory ? 'حفظ التغييرات' : 'إضافة'}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
