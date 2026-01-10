"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Clock, Users, Calendar, Award, ArrowLeft, ChevronDown, ChevronUp, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { catalogService } from "@/services/catalog";
import { getProgramCohorts, CohortResponse } from "@/services/registration/registration.service";
import { Program } from "@/services/catalog/types";
import { useAuth } from "@/contexts/AuthContext";

// Mock program data
const programsData: Record<string, {
    id: string;
    title: string;
    category: string;
    description: string;
    duration: string;
    weeks: number;
    price: number;
    instructor: {
        name: string;
        title: string;
        bio: string;
    };
    modules: { title: string; topics: string[] }[];
    requirements: string[];
    outcomes: string[];
    rating: number;
    students: number;
}> = {
    "ai-fundamentals": {
        id: "1",
        title: "أساسيات الذكاء الاصطناعي",
        category: "التقنية",
        description: "دورة شاملة تغطي أساسيات الذكاء الاصطناعي والتعلم الآلي. ستتعلم المفاهيم الأساسية والتطبيقات العملية في مختلف المجالات.",
        duration: "6 أسابيع",
        weeks: 6,
        price: 1800,
        instructor: {
            name: "د. أحمد محمد المالكي",
            title: "أستاذ مشارك في علوم الحاسب",
            bio: "خبرة أكثر من 15 عاماً في مجال الذكاء الاصطناعي والتعلم الآلي، مع العديد من الأبحاث المنشورة في المجلات العلمية العالمية."
        },
        modules: [
            { title: "مقدمة في الذكاء الاصطناعي", topics: ["تاريخ AI", "أنواع الذكاء الاصطناعي", "تطبيقات معاصرة"] },
            { title: "أساسيات التعلم الآلي", topics: ["التعلم المُشرف", "التعلم غير المُشرف", "تقييم النماذج"] },
            { title: "الشبكات العصبية", topics: ["البنية الأساسية", "التدريب والضبط", "التطبيقات"] },
            { title: "معالجة اللغات الطبيعية", topics: ["تحليل النصوص", "المحادثة الآلية", "الترجمة الآلية"] },
            { title: "الرؤية الحاسوبية", topics: ["معالجة الصور", "التعرف على الأشياء", "تطبيقات عملية"] },
            { title: "مشروع تطبيقي", topics: ["تصميم المشروع", "التنفيذ", "العرض النهائي"] },
        ],
        requirements: ["معرفة أساسية بالبرمجة", "إلمام بالرياضيات الأساسية", "جهاز كمبيوتر مع اتصال إنترنت"],
        outcomes: ["فهم أساسيات الذكاء الاصطناعي", "القدرة على بناء نماذج تعلم آلي بسيطة", "تطبيق AI في حل مشكلات حقيقية", "شهادة معتمدة من الجامعة"],
        rating: 4.8,
        students: 450,
    },
    "project-management": {
        id: "2",
        title: "إدارة المشاريع الاحترافية PMP",
        category: "الإدارة",
        description: "برنامج تدريبي متكامل يؤهلك للحصول على شهادة PMP المعتمدة دولياً. يغطي جميع مجالات المعرفة في إدارة المشاريع.",
        duration: "8 أسابيع",
        weeks: 8,
        price: 2500,
        instructor: {
            name: "أ. سارة العبدالله",
            title: "خبيرة في إدارة المشاريع",
            bio: "مدربة معتمدة من PMI مع خبرة تزيد عن 12 عاماً في إدارة المشاريع الكبرى في القطاعين الحكومي والخاص."
        },
        modules: [
            { title: "مقدمة في إدارة المشاريع", topics: ["المفاهيم الأساسية", "دورة حياة المشروع", "أصحاب المصلحة"] },
            { title: "تخطيط المشروع", topics: ["تحديد النطاق", "جدولة الأنشطة", "تقدير الموارد"] },
            { title: "إدارة التكاليف", topics: ["تقدير التكاليف", "الموازنة", "التحكم في التكاليف"] },
            { title: "إدارة الجودة والمخاطر", topics: ["تخطيط الجودة", "تحديد المخاطر", "استراتيجيات الاستجابة"] },
        ],
        requirements: ["خبرة في إدارة المشاريع أو العمل في فرق مشاريع", "مهارات تواصل جيدة"],
        outcomes: ["الاستعداد لامتحان PMP", "فهم معايير PMI", "مهارات إدارة مشاريع فعالة", "شهادة معتمدة"],
        rating: 4.9,
        students: 320,
    },
};

// Default program for unknown slugs
const defaultProgram = {
    id: "0",
    title: "برنامج تدريبي",
    category: "عام",
    description: "وصف البرنامج التدريبي سيتم إضافته قريباً.",
    duration: "4 أسابيع",
    weeks: 4,
    price: 1500,
    instructor: {
        name: "مدرب معتمد",
        title: "خبير في المجال",
        bio: "خبرة واسعة في مجال التدريب والتطوير المهني."
    },
    modules: [
        { title: "الوحدة الأولى", topics: ["موضوع 1", "موضوع 2", "موضوع 3"] },
        { title: "الوحدة الثانية", topics: ["موضوع 1", "موضوع 2", "موضوع 3"] },
    ],
    requirements: ["لا توجد متطلبات مسبقة"],
    outcomes: ["شهادة معتمدة من الجامعة السعودية الإلكترونية"],
    rating: 4.5,
    students: 100,
};

function ModuleAccordion({ module, index }: { module: { title: string; topics: string[] }; index: number }) {
    const [isOpen, setIsOpen] = useState(index === 0);

    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-right"
            >
                <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center">
                        {index + 1}
                    </span>
                    <span className="font-bold text-gray-900">{module.title}</span>
                </div>
                {isOpen ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
            </button>
            {isOpen && (
                <div className="p-4 bg-white">
                    <ul className="space-y-2">
                        {module.topics.map((topic, i) => (
                            <li key={i} className="flex items-center gap-2 text-gray-600">
                                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                                {topic}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default function ProgramDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    const program = programsData[slug] || defaultProgram;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />

            <main className="flex-1">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-primary to-primary-dark text-white py-16">
                    <div className="container mx-auto px-6 lg:px-12 max-w-[1400px]">
                        <div className="flex items-center gap-2 text-gray-300 text-sm mb-4">
                            <Link href="/" className="hover:text-accent">الرئيسية</Link>
                            <span>/</span>
                            <Link href="/programs" className="hover:text-accent">البرامج</Link>
                            <span>/</span>
                            <span className="text-accent">{program.category}</span>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <span className="inline-block bg-accent/20 text-accent px-3 py-1 rounded-full text-sm font-medium mb-4">
                                {program.category}
                            </span>
                            <h1 className="text-4xl md:text-5xl font-bold mb-6">{program.title}</h1>
                            <p className="text-xl text-gray-200 max-w-3xl mb-8">{program.description}</p>

                            <div className="flex flex-wrap items-center gap-6 text-gray-200">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5" />
                                    {program.duration}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    {program.students} متدرب
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-yellow-400">⭐</span>
                                    {program.rating} تقييم
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                <div className="container mx-auto px-6 lg:px-12 max-w-[1400px] py-12">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Main Content */}
                        <div className="flex-1 space-y-8">
                            {/* Course Modules */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white rounded-2xl p-6 border border-gray-200"
                            >
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">محتوى البرنامج</h2>
                                <div className="space-y-3">
                                    {program.modules.map((module, index) => (
                                        <ModuleAccordion key={index} module={module} index={index} />
                                    ))}
                                </div>
                            </motion.div>

                            {/* Requirements */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-2xl p-6 border border-gray-200"
                            >
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">المتطلبات</h2>
                                <ul className="space-y-2">
                                    {program.requirements.map((req, i) => (
                                        <li key={i} className="flex items-center gap-2 text-gray-600">
                                            <span className="text-accent">✓</span>
                                            {req}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>

                            {/* Outcomes */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white rounded-2xl p-6 border border-gray-200"
                            >
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">ماذا ستتعلم؟</h2>
                                <ul className="grid md:grid-cols-2 gap-3">
                                    {program.outcomes.map((outcome, i) => (
                                        <li key={i} className="flex items-center gap-2 text-gray-600">
                                            <Award className="w-5 h-5 text-accent flex-shrink-0" />
                                            {outcome}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>

                            {/* Instructor */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-white rounded-2xl p-6 border border-gray-200"
                            >
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">المدرب</h2>
                                <div className="flex items-start gap-4">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold">
                                        {program.instructor.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{program.instructor.name}</h3>
                                        <p className="text-accent font-medium mb-2">{program.instructor.title}</p>
                                        <p className="text-gray-600">{program.instructor.bio}</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Sidebar - Registration Card */}
                        <div className="lg:w-96">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="sticky top-24 bg-white rounded-2xl p-6 border border-gray-200 shadow-lg"
                            >
                                <div className="text-center mb-6">
                                    <div className="text-4xl font-bold text-primary mb-2">
                                        {program.price.toLocaleString()} ر.س
                                    </div>
                                    <p className="text-gray-500">شامل ضريبة القيمة المضافة</p>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                        <span className="text-gray-600">المدة</span>
                                        <span className="font-bold text-gray-900">{program.duration}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                        <span className="text-gray-600">عدد الوحدات</span>
                                        <span className="font-bold text-gray-900">{program.modules.length}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                        <span className="text-gray-600">اللغة</span>
                                        <span className="font-bold text-gray-900">العربية</span>
                                    </div>
                                    <div className="flex items-center justify-between py-3">
                                        <span className="text-gray-600">الشهادة</span>
                                        <span className="font-bold text-accent">معتمدة</span>
                                    </div>
                                </div>

                                <Button size="lg" className="w-full text-lg gap-2 mb-3">
                                    سجل الآن
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>

                                <Button size="lg" variant="outline" className="w-full">
                                    تحدث مع مستشار
                                </Button>

                                <p className="text-center text-sm text-gray-500 mt-4">
                                    متاح التقسيط عبر تابي وتمارا
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
