"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, X, Clock, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { catalogService } from "@/services/catalog";
import { Program, Category } from "@/services/catalog/types";
import { ProgramCard } from "@/components/catalog";


export default function ProgramsPage() {
    const [programs, setPrograms] = useState<Program[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [deliveryMode, setDeliveryMode] = useState<string | null>(null);
    const [availabilityFilter, setAvailabilityFilter] = useState<string | null>(null);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const [programsData, categoriesData] = await Promise.all([
                catalogService.getPrograms({ status: 'PUBLISHED' }),
                catalogService.getCategories(),
            ]);
            setPrograms(programsData.data);
            setCategories(categoriesData);
        } catch (err: any) {
            setError(err.message || 'فشل تحميل البرامج. يرجى المحاولة مرة أخرى.');
        } finally {
            setIsLoading(false);
        }
    };

    // Filter programs
    const filteredPrograms = programs.filter((program) => {
        const matchesSearch =
            searchQuery === "" ||
            program.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
            program.titleEn.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory =
            !selectedCategory || program.categoryId === selectedCategory;

        const matchesDeliveryMode =
            !deliveryMode || program.deliveryMode === deliveryMode;

        const matchesAvailability =
            !availabilityFilter || program.availabilityStatus === availabilityFilter;

        const price = typeof program.price === 'string' ? parseFloat(program.price) : program.price;
        const matchesPrice = price >= priceRange[0] && price <= priceRange[1];

        return matchesSearch && matchesCategory && matchesDeliveryMode && matchesAvailability && matchesPrice;
    });

    const clearFilters = () => {
        setSelectedCategory(null);
        setDeliveryMode(null);
        setAvailabilityFilter(null);
        setPriceRange([0, 10000]);
        setSearchQuery("");
    };

    const activeFiltersCount =
        (selectedCategory ? 1 : 0) +
        (deliveryMode ? 1 : 0) +
        (availabilityFilter ? 1 : 0) +
        (priceRange[0] !== 0 || priceRange[1] !== 10000 ? 1 : 0);

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Header />
                <main className="flex-1">
                    <div className="bg-gradient-to-br from-primary to-primary-dark text-white py-16">
                        <div className="container mx-auto px-6 lg:px-12 max-w-[1400px]">
                            <h1 className="text-4xl font-bold mb-4">تصفح البرامج</h1>
                            <p className="text-xl text-gray-200">
                                اكتشف البرامج التدريبية المعتمدة من الجامعة السعودية الإلكترونية
                            </p>
                        </div>
                    </div>
                    <div className="flex-1 flex items-center justify-center py-20">
                        <div className="text-center">
                            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                            <p className="text-gray-600">جاري تحميل البرامج...</p>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Header />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center max-w-md mx-auto px-6">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">حدث خطأ</h2>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <Button onClick={loadData}>إعادة المحاولة</Button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />

            <main className="flex-1">
                {/* Page Header */}
                <div className="bg-gradient-to-br from-primary to-primary-dark text-white py-16">
                    <div className="container mx-auto px-6 lg:px-12 max-w-[1400px]">
                        <h1 className="text-4xl font-bold mb-4">تصفح البرامج</h1>
                        <p className="text-xl text-gray-200">
                            اكتشف البرامج التدريبية المعتمدة من الجامعة السعودية الإلكترونية
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
                                                    <span className="text-sm font-medium">{category.nameAr}</span>
                                                    {category._count && (
                                                        <span className="text-xs opacity-75">
                                                            {category._count.programs}
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Delivery Mode Filter */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-bold text-gray-900 mb-3">نمط التقديم</h3>
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => setDeliveryMode(null)}
                                            className={`w-full text-right px-4 py-2 rounded-lg transition-colors ${
                                                !deliveryMode
                                                    ? "bg-accent text-white"
                                                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                                            }`}
                                        >
                                            <span className="text-sm font-medium">الكل</span>
                                        </button>
                                        <button
                                            onClick={() => setDeliveryMode('ONLINE')}
                                            className={`w-full text-right px-4 py-2 rounded-lg transition-colors ${
                                                deliveryMode === 'ONLINE'
                                                    ? "bg-accent text-white"
                                                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                                            }`}
                                        >
                                            <span className="text-sm font-medium">عن بُعد</span>
                                        </button>
                                        <button
                                            onClick={() => setDeliveryMode('IN_PERSON')}
                                            className={`w-full text-right px-4 py-2 rounded-lg transition-colors ${
                                                deliveryMode === 'IN_PERSON'
                                                    ? "bg-accent text-white"
                                                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                                            }`}
                                        >
                                            <span className="text-sm font-medium">حضوري</span>
                                        </button>
                                        <button
                                            onClick={() => setDeliveryMode('HYBRID')}
                                            className={`w-full text-right px-4 py-2 rounded-lg transition-colors ${
                                                deliveryMode === 'HYBRID'
                                                    ? "bg-accent text-white"
                                                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                                            }`}
                                        >
                                            <span className="text-sm font-medium">مدمج</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Availability Filter */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-bold text-gray-900 mb-3">التوفر</h3>
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => setAvailabilityFilter(null)}
                                            className={`w-full text-right px-4 py-2 rounded-lg transition-colors ${
                                                !availabilityFilter
                                                    ? "bg-accent text-white"
                                                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                                            }`}
                                        >
                                            <span className="text-sm font-medium">الكل</span>
                                        </button>
                                        <button
                                            onClick={() => setAvailabilityFilter('AVAILABLE')}
                                            className={`w-full text-right px-4 py-2 rounded-lg transition-colors ${
                                                availabilityFilter === 'AVAILABLE'
                                                    ? "bg-accent text-white"
                                                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                                            }`}
                                        >
                                            <span className="text-sm font-medium">متاح للتسجيل</span>
                                        </button>
                                        <button
                                            onClick={() => setAvailabilityFilter('UPCOMING')}
                                            className={`w-full text-right px-4 py-2 rounded-lg transition-colors ${
                                                availabilityFilter === 'UPCOMING'
                                                    ? "bg-accent text-white"
                                                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                                            }`}
                                        >
                                            <span className="text-sm font-medium">يبدأ قريباً</span>
                                        </button>
                                        <button
                                            onClick={() => setAvailabilityFilter('COMING_SOON')}
                                            className={`w-full text-right px-4 py-2 rounded-lg transition-colors ${
                                                availabilityFilter === 'COMING_SOON'
                                                    ? "bg-accent text-white"
                                                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                                            }`}
                                        >
                                            <span className="text-sm font-medium">قريباً</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Price Range */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 mb-3">السعر</h3>
                                    <div className="space-y-3">
                                        <input
                                            type="range"
                                            min="0"
                                            max="10000"
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
                                        <ProgramCard key={program.id} program={program} index={index} />
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
                                                {category.nameAr}
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
