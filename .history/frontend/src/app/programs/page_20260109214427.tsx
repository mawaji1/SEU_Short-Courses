"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, X, Clock, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

// Mock data
const mockPrograms = [
    {
        id: "1",
        slug: "ai-fundamentals",
        title: "أساسيات الذكاء الاصطناعي",
        category: "التقنية",
        categoryId: "tech",
        duration: "6 أسابيع",
        price: 1800,
        instructor: "د. أحمد محمد المالكي",
        rating: 4.8,
    },
    {
        id: "2",
        slug: "project-management",
        title: "إدارة المشاريع الاحترافية PMP",
        category: "الإدارة",
        categoryId: "management",
        duration: "8 أسابيع",
        price: 2500,
        instructor: "أ. سارة العبدالله",
        rating: 4.9,
    },
    {
        id: "3",
        slug: "leadership-skills",
        title: "ورشة مهارات القيادة",
        category: "التطوير الذاتي",
        categoryId: "leadership",
        duration: "4 أسابيع",
        price: 1200,
        instructor: "د. فهد الغامدي",
        rating: 4.7,
    },
    {
        id: "4",
        slug: "data-analysis-python",
        title: "تحليل البيانات باستخدام Python",
        category: "التقنية",
        categoryId: "tech",
        duration: "6 أسابيع",
        price: 1800,
        instructor: "م. خالد الشهري",
        rating: 4.9,
    },
    {
        id: "5",
        slug: "digital-marketing",
        title: "التسويق الرقمي الاحترافي",
        category: "التسويق",
        categoryId: "marketing",
        duration: "5 أسابيع",
        price: 1500,
        instructor: "أ. نورة الحربي",
        rating: 4.6,
    },
    {
        id: "6",
        slug: "cybersecurity-basics",
        title: "أساسيات الأمن السيبراني",
        category: "التقنية",
        categoryId: "tech",
        duration: "7 أسابيع",
        price: 2200,
        instructor: "د. عبدالله الدوسري",
        rating: 4.8,
    },
];

const categories = [
    { id: "tech", name: "التقنية", count: 3 },
    { id: "management", name: "الإدارة", count: 1 },
    { id: "leadership", name: "التطوير الذاتي", count: 1 },
    { id: "marketing", name: "التسويق", count: 1 },
];

export default function ProgramsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
    const [showFilters, setShowFilters] = useState(false);

    // Filter programs
    const filteredPrograms = mockPrograms.filter((program) => {
        const matchesSearch =
            searchQuery === "" ||
            program.title.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory =
            !selectedCategory || program.categoryId === selectedCategory;

        const matchesPrice =
            program.price >= priceRange[0] && program.price <= priceRange[1];

        return matchesSearch && matchesCategory && matchesPrice;
    });

    const clearFilters = () => {
        setSelectedCategory(null);
        setPriceRange([0, 5000]);
        setSearchQuery("");
    };

    const activeFiltersCount =
        (selectedCategory ? 1 : 0) +
        (priceRange[0] !== 0 || priceRange[1] !== 5000 ? 1 : 0);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />

            <main className="flex-1">
                {/* Page Header */}
                <div className="bg-gradient-to-br from-primary to-primary-dark text-white py-16">
                    <div className="container mx-auto px-6 lg:px-12 max-w-[1400px]">
                        <h1 className="text-4xl font-bold mb-4">تصفح البرامج</h1>
                        <p className="text-xl text-gray-200">
                            اكتشف {mockPrograms.length} برنامج تدريبي معتمد من الجامعة السعودية الإلكترونية
                        </p>
                    </div>
                </div>

                <div className="container mx-auto px-6 lg:px-12 max-w-[1400px] py-12">
                    <div className="flex gap-8">
                        {/* Sidebar Filters - Desktop */}
                        <aside className="hidden lg:block w-80 flex-shrink-0">
                            <div className="sticky top-24 bg-white rounded-2xl p-6 border border-gray-200">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-gray-900">الفلاتر</h2>
                                    {activeFiltersCount > 0 && (
                                        <button
                                            onClick={clearFilters}
                                            className="text-sm text-accent hover:text-accent-light font-medium"
                                        >
                                            مسح الكل
                                        </button>
                                    )}
                                </div>

                                {/* Category Filter */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-bold text-gray-900 mb-3">التخصص</h3>
                                    <div className="space-y-2">
                                        {categories.map((category) => (
                                            <button
                                                key={category.id}
                                                onClick={() =>
                                                    setSelectedCategory(
                                                        selectedCategory === category.id ? null : category.id
                                                    )
                                                }
                                                className={`w-full text-right px-4 py-2 rounded-lg transition-colors ${selectedCategory === category.id
                                                        ? "bg-accent text-white"
                                                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium">{category.name}</span>
                                                    <span className="text-xs opacity-75">
                                                        {category.count}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Price Range */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 mb-3">السعر</h3>
                                    <div className="space-y-3">
                                        <input
                                            type="range"
                                            min="0"
                                            max="5000"
                                            step="500"
                                            value={priceRange[1]}
                                            onChange={(e) =>
                                                setPriceRange([priceRange[0], parseInt(e.target.value)])
                                            }
                                            className="w-full accent-accent"
                                        />
                                        <div className="flex items-center justify-between text-sm text-gray-600">
                                            <span>0 ر.س</span>
                                            <span className="font-medium text-accent">
                                                {priceRange[1].toLocaleString("ar-SA")} ر.س
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Main Content */}
                        <div className="flex-1">
                            {/* Search and Mobile Filter Toggle */}
                            <div className="mb-6">
                                <div className="flex gap-3">
                                    <div className="flex-1 relative">
                                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="ابحث عن برنامج..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full h-12 pr-12 pl-4 rounded-xl border border-gray-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                                        />
                                    </div>
                                    <button
                                        onClick={() => setShowFilters(!showFilters)}
                                        className="lg:hidden flex items-center gap-2 px-4 h-12 bg-white border border-gray-200 rounded-xl hover:border-accent transition-colors"
                                    >
                                        <SlidersHorizontal className="w-5 h-5" />
                                        {activeFiltersCount > 0 && (
                                            <span className="w-5 h-5 rounded-full bg-accent text-white text-xs flex items-center justify-center">
                                                {activeFiltersCount}
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Results Count */}
                            <div className="flex items-center justify-between mb-6">
                                <p className="text-gray-600">
                                    <span className="font-bold text-gray-900">{filteredPrograms.length}</span>{" "}
                                    برنامج متاح
                                </p>
                            </div>

                            {/* Programs Grid */}
                            {filteredPrograms.length > 0 ? (
                                <div className="grid md:grid-cols-2 gap-6">
                                    {filteredPrograms.map((program, index) => (
                                        <motion.div
                                            key={program.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <Link href={`/programs/${program.slug}`}>
                                                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                                    <div className="h-40 bg-gradient-to-br from-primary/10 to-accent/10" />
                                                    <div className="p-6">
                                                        <span className="text-sm font-medium text-accent">{program.category}</span>
                                                        <h3 className="text-xl font-bold text-gray-900 mt-2 mb-3">{program.title}</h3>
                                                        <p className="text-sm text-gray-500 mb-4">{program.instructor}</p>
                                                        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                                                            <div className="flex items-center gap-2">
                                                                <Clock className="w-4 h-4" />
                                                                {program.duration}
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-yellow-500">⭐</span>
                                                                {program.rating}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-lg font-bold text-primary">{program.price.toLocaleString()} ر.س</span>
                                                            <Button size="sm" className="gap-2">
                                                                التفاصيل
                                                                <ArrowLeft className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20">
                                    <div className="text-6xl mb-4">🔍</div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                        لم نجد أي برامج
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        جرب تعديل معايير البحث أو الفلاتر
                                    </p>
                                    <Button onClick={clearFilters}>مسح جميع الفلاتر</Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Filters Modal */}
                {showFilters && (
                    <div className="lg:hidden fixed inset-0 bg-black/50 z-50 flex items-end">
                        <div className="bg-white w-full rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold">الفلاتر</h2>
                                <button onClick={() => setShowFilters(false)}>
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Category */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 mb-3">التخصص</h3>
                                    <div className="space-y-2">
                                        {categories.map((category) => (
                                            <button
                                                key={category.id}
                                                onClick={() => {
                                                    setSelectedCategory(
                                                        selectedCategory === category.id ? null : category.id
                                                    );
                                                    setShowFilters(false);
                                                }}
                                                className={`w-full text-right px-4 py-2 rounded-lg transition-colors ${selectedCategory === category.id
                                                        ? "bg-accent text-white"
                                                        : "bg-gray-50 text-gray-700"
                                                    }`}
                                            >
                                                {category.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button onClick={clearFilters} variant="outline" className="flex-1">
                                        مسح الكل
                                    </Button>
                                    <Button onClick={() => setShowFilters(false)} className="flex-1">
                                        تطبيق
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
