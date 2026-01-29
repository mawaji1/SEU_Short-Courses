"use client";

import { useState } from "react";
import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChevronDown, Search, HelpCircle, CreditCard, GraduationCap, Clock, Award, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const faqCategories = [
    { id: "registration", label: "التسجيل", icon: Users },
    { id: "payment", label: "الدفع", icon: CreditCard },
    { id: "programs", label: "البرامج", icon: GraduationCap },
    { id: "certificates", label: "الشهادات", icon: Award },
    { id: "technical", label: "الدعم الفني", icon: HelpCircle },
];

const faqs = [
    {
        category: "registration",
        question: "كيف يمكنني التسجيل في برنامج تدريبي؟",
        answer: "يمكنك التسجيل في أي برنامج تدريبي من خلال: 1) إنشاء حساب على المنصة، 2) اختيار البرنامج المناسب من قائمة البرامج، 3) اختيار الدفعة المناسبة، 4) إتمام عملية الدفع. بعد إتمام التسجيل، ستصلك رسالة تأكيد على بريدك الإلكتروني مع تفاصيل البرنامج.",
    },
    {
        category: "registration",
        question: "هل يمكنني التسجيل في أكثر من برنامج في نفس الوقت؟",
        answer: "نعم، يمكنك التسجيل في عدة برامج في نفس الوقت، بشرط عدم تعارض مواعيد الجلسات التدريبية. ننصح بالتأكد من قدرتك على الالتزام بمتطلبات جميع البرامج المسجل فيها.",
    },
    {
        category: "registration",
        question: "ما هي متطلبات التسجيل في البرامج التدريبية؟",
        answer: "تختلف متطلبات التسجيل حسب كل برنامج. بشكل عام، يُشترط: 1) حساب فعال على المنصة، 2) استيفاء المتطلبات السابقة للبرنامج (إن وجدت)، 3) سداد رسوم البرنامج. يمكنك الاطلاع على المتطلبات التفصيلية في صفحة كل برنامج.",
    },
    {
        category: "payment",
        question: "ما هي طرق الدفع المتاحة؟",
        answer: "نوفر عدة طرق للدفع تشمل: 1) البطاقات الائتمانية (Visa, Mastercard, Mada)، 2) خدمات الدفع الآجل (Tabby, Tamara) للتقسيط بدون فوائد. جميع عمليات الدفع مؤمنة ومشفرة لضمان حماية بياناتك المالية.",
    },
    {
        category: "payment",
        question: "هل يمكنني استرداد رسوم البرنامج؟",
        answer: "نعم، يمكن استرداد الرسوم وفق الشروط التالية: 1) استرداد كامل قبل بدء البرنامج بأسبوعين، 2) استرداد 50% قبل بدء البرنامج بأسبوع، 3) لا يمكن الاسترداد بعد بدء البرنامج. للطلب، تواصل مع الدعم الفني مع إرفاق رقم التسجيل.",
    },
    {
        category: "payment",
        question: "هل تتوفر خصومات أو أكواد ترويجية؟",
        answer: "نعم، نوفر خصومات متنوعة تشمل: 1) خصم التسجيل المبكر (حتى 20%)، 2) خصومات للمجموعات والمؤسسات، 3) أكواد ترويجية في المناسبات الخاصة. تابع حساباتنا على وسائل التواصل للاطلاع على آخر العروض.",
    },
    {
        category: "programs",
        question: "ما الفرق بين البرامج الحضورية وعن بُعد؟",
        answer: "البرامج الحضورية تُقام في مقرات الجامعة مع تفاعل مباشر مع المدرب والمتدربين. البرامج عن بُعد تُقدم عبر منصة Zoom مع نفس جودة المحتوى والتفاعل. البرامج المدمجة تجمع بين الاثنين. جميع الأنماط تمنح نفس الشهادة المعتمدة.",
    },
    {
        category: "programs",
        question: "كم ساعة يجب أن أحضر للحصول على الشهادة؟",
        answer: "للحصول على الشهادة، يجب حضور 75% على الأقل من إجمالي ساعات البرنامج التدريبي. يتم تسجيل الحضور إلكترونياً في كل جلسة، ويمكنك متابعة نسبة حضورك من لوحة التحكم الخاصة بك.",
    },
    {
        category: "programs",
        question: "هل يمكنني الانسحاب من البرنامج والتحويل لدفعة أخرى؟",
        answer: "نعم، يمكنك التحويل لدفعة أخرى من نفس البرنامج قبل بدء البرنامج بأسبوع على الأقل، وذلك حسب توفر المقاعد. للتحويل، تواصل مع الدعم الفني وسيتم مساعدتك في إتمام الإجراءات.",
    },
    {
        category: "certificates",
        question: "متى أحصل على الشهادة بعد انتهاء البرنامج؟",
        answer: "تُصدر الشهادة خلال 3-5 أيام عمل بعد انتهاء البرنامج والتحقق من استيفاء متطلبات الحصول عليها (نسبة الحضور). ستصلك رسالة على بريدك الإلكتروني فور جاهزية الشهادة للتحميل.",
    },
    {
        category: "certificates",
        question: "هل الشهادة معتمدة؟",
        answer: "نعم، جميع شهاداتنا معتمدة من معهد البحوث والدراسات الاستشارية بالجامعة السعودية الإلكترونية. الشهادة تحمل رقم تحقق فريد يمكن التحقق منه إلكترونياً عبر المنصة.",
    },
    {
        category: "certificates",
        question: "كيف يمكنني التحقق من صحة الشهادة؟",
        answer: "يمكن التحقق من صحة أي شهادة من خلال: 1) زيارة صفحة التحقق على المنصة، 2) إدخال رقم التحقق المطبوع على الشهادة، 3) عرض تفاصيل الشهادة والتأكد من صحتها. هذه الخدمة متاحة للجميع.",
    },
    {
        category: "technical",
        question: "نسيت كلمة المرور، كيف يمكنني استعادتها؟",
        answer: "يمكنك استعادة كلمة المرور من خلال: 1) الضغط على 'نسيت كلمة المرور' في صفحة تسجيل الدخول، 2) إدخال بريدك الإلكتروني المسجل، 3) ستصلك رسالة بها رابط لإعادة تعيين كلمة المرور. الرابط صالح لمدة 24 ساعة.",
    },
    {
        category: "technical",
        question: "ما هي متطلبات حضور الجلسات عن بُعد؟",
        answer: "لحضور الجلسات عن بُعد، تحتاج: 1) جهاز كمبيوتر أو جوال مع اتصال إنترنت مستقر، 2) متصفح حديث (Chrome, Firefox, Safari)، 3) سماعات ومايكروفون للتفاعل. ننصح باستخدام سرعة إنترنت لا تقل عن 5 ميجابت/ثانية.",
    },
    {
        category: "technical",
        question: "كيف أتواصل مع الدعم الفني؟",
        answer: "يمكنك التواصل مع الدعم الفني عبر: 1) صفحة الدعم على المنصة، 2) البريد الإلكتروني: INFO.RSI@seu.edu.sa، 3) الهاتف: 0112613789. ساعات العمل: الأحد - الخميس، 8 صباحاً - 4 مساءً.",
    },
];

export default function FAQPage() {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [openItems, setOpenItems] = useState<number[]>([]);

    const filteredFaqs = faqs.filter((faq) => {
        const matchesCategory = !selectedCategory || faq.category === selectedCategory;
        const matchesSearch =
            searchQuery === "" ||
            faq.question.includes(searchQuery) ||
            faq.answer.includes(searchQuery);
        return matchesCategory && matchesSearch;
    });

    const toggleItem = (index: number) => {
        setOpenItems((prev) =>
            prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
        );
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="bg-gradient-to-br from-primary to-primary-dark text-white py-16">
                    <div className="container mx-auto px-6 lg:px-12 max-w-[1400px]">
                        <div className="max-w-3xl mx-auto text-center">
                            <h1 className="text-4xl md:text-5xl font-bold mb-6">
                                الأسئلة الشائعة
                            </h1>
                            <p className="text-xl text-gray-200 mb-8">
                                إجابات على أكثر الأسئلة شيوعاً حول برامجنا التدريبية
                            </p>
                            <div className="relative max-w-xl mx-auto">
                                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="ابحث عن سؤال..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    aria-label="ابحث عن سؤال"
                                    className="w-full h-14 pr-12 pl-4 rounded-2xl border-0 text-gray-900 focus:ring-2 focus:ring-accent outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Categories */}
                <section className="py-8 bg-white border-b">
                    <div className="container mx-auto px-6 lg:px-12 max-w-[1400px]">
                        <div className="flex flex-wrap justify-center gap-3">
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                                    !selectedCategory
                                        ? "bg-accent text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                                الكل
                            </button>
                            {faqCategories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.id)}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
                                        selectedCategory === category.id
                                            ? "bg-accent text-white"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    <category.icon className="w-5 h-5" />
                                    {category.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ List */}
                <section className="py-16">
                    <div className="container mx-auto px-6 lg:px-12 max-w-[900px]">
                        {filteredFaqs.length > 0 ? (
                            <div className="space-y-4">
                                {filteredFaqs.map((faq, index) => (
                                    <div
                                        key={index}
                                        className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
                                    >
                                        <button
                                            onClick={() => toggleItem(index)}
                                            className="w-full flex items-center justify-between p-6 text-right hover:bg-gray-50 transition-colors"
                                        >
                                            <span className="font-bold text-gray-900 text-lg">
                                                {faq.question}
                                            </span>
                                            <ChevronDown
                                                className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 mr-4 ${
                                                    openItems.includes(index) ? "rotate-180" : ""
                                                }`}
                                            />
                                        </button>
                                        {openItems.includes(index) && (
                                            <div className="px-6 pb-6">
                                                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                                                    {faq.answer}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    لم نجد نتائج
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    جرب البحث بكلمات مختلفة أو تصفح الأقسام
                                </p>
                                <Button onClick={() => { setSearchQuery(""); setSelectedCategory(null); }}>
                                    عرض جميع الأسئلة
                                </Button>
                            </div>
                        )}
                    </div>
                </section>

                {/* Still Have Questions */}
                <section className="py-16 bg-white">
                    <div className="container mx-auto px-6 lg:px-12 max-w-[1400px]">
                        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-8 md:p-12 text-white text-center">
                            <h2 className="text-2xl md:text-3xl font-bold mb-4">
                                لم تجد إجابة لسؤالك؟
                            </h2>
                            <p className="text-gray-200 mb-8 max-w-xl mx-auto">
                                فريق الدعم الفني جاهز لمساعدتك. تواصل معنا وسنرد عليك في أقرب وقت.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/contact">
                                    <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                                        تواصل معنا
                                    </Button>
                                </Link>
                                <Link href="/support">
                                    <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10">
                                        الدعم الفني
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
