import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
    HelpCircle,
    MessageCircle,
    Mail,
    Phone,
    FileText,
    Video,
    BookOpen,
    Clock,
    ChevronLeft,
} from "lucide-react";

export const metadata: Metadata = {
    title: "الدعم الفني | التعليم التنفيذي - معهد البحوث والدراسات الاستشارية",
    description: "احصل على الدعم الفني لمنصة التعليم التنفيذي بمعهد البحوث والدراسات الاستشارية. نحن هنا لمساعدتك في أي استفسارات تتعلق بالتسجيل، الدفع، البرامج التدريبية، أو الشهادات.",
    openGraph: {
        title: "الدعم الفني | التعليم التنفيذي - معهد البحوث والدراسات",
        description: "احصل على المساعدة والدعم الفني لمنصة التعليم التنفيذي",
        type: "website",
    },
};

const supportOptions = [
    {
        icon: HelpCircle,
        title: "الأسئلة الشائعة",
        description: "إجابات على أكثر الأسئلة شيوعاً حول المنصة والبرامج",
        href: "/faq",
        color: "bg-blue-500",
    },
    {
        icon: MessageCircle,
        title: "تواصل معنا",
        description: "أرسل رسالة لفريق الدعم وسنرد عليك في أقرب وقت",
        href: "/contact",
        color: "bg-green-500",
    },
    {
        icon: Mail,
        title: "البريد الإلكتروني",
        description: "راسلنا على INFO.RSI@seu.edu.sa",
        href: "mailto:INFO.RSI@seu.edu.sa",
        color: "bg-purple-500",
    },
    {
        icon: Phone,
        title: "اتصل بنا",
        description: "0112613789 (الأحد - الخميس، 8ص - 4م)",
        href: "tel:0112613789",
        color: "bg-orange-500",
    },
];

const resources = [
    {
        icon: BookOpen,
        title: "دليل المستخدم",
        description: "تعرف على كيفية استخدام المنصة خطوة بخطوة",
        href: "#",
    },
    {
        icon: Video,
        title: "فيديوهات تعليمية",
        description: "شاهد فيديوهات توضيحية لاستخدام المنصة",
        href: "#",
    },
    {
        icon: FileText,
        title: "الشروط والأحكام",
        description: "اطلع على شروط وأحكام استخدام المنصة",
        href: "/terms",
    },
];

const commonIssues = [
    {
        title: "مشاكل تسجيل الدخول",
        solutions: [
            "تأكد من صحة البريد الإلكتروني وكلمة المرور",
            "استخدم خاصية 'نسيت كلمة المرور' لإعادة تعيينها",
            "تأكد من تفعيل حسابك عبر رابط التفعيل المرسل لبريدك",
            "جرب تسجيل الدخول من متصفح آخر أو وضع التصفح الخاص",
        ],
    },
    {
        title: "مشاكل الدفع",
        solutions: [
            "تأكد من صلاحية البطاقة وتوفر الرصيد الكافي",
            "تأكد من إدخال بيانات البطاقة بشكل صحيح",
            "جرب طريقة دفع أخرى (مدى، فيزا، تابي، تمارا)",
            "تواصل مع البنك للتأكد من عدم حظر العملية",
        ],
    },
    {
        title: "مشاكل حضور الجلسات",
        solutions: [
            "تأكد من استقرار اتصال الإنترنت (5 ميجابت/ثانية على الأقل)",
            "استخدم متصفح Chrome أو Firefox المحدث",
            "أغلق البرامج الأخرى التي تستهلك الإنترنت",
            "جرب الاتصال من جهاز آخر",
        ],
    },
    {
        title: "مشاكل الشهادات",
        solutions: [
            "تأكد من استيفاء نسبة الحضور المطلوبة (75%)",
            "انتظر 3-5 أيام عمل بعد انتهاء البرنامج",
            "تحقق من صندوق البريد غير المرغوب (Spam)",
            "تواصل مع الدعم إذا لم تصلك الشهادة",
        ],
    },
];

export default function SupportPage() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="bg-gradient-to-br from-primary to-primary-dark text-white py-16">
                    <div className="container mx-auto px-6 lg:px-12 max-w-[1400px]">
                        <div className="max-w-3xl">
                            <h1 className="text-4xl md:text-5xl font-bold mb-6">
                                مركز الدعم الفني
                            </h1>
                            <p className="text-xl text-gray-200">
                                نحن هنا لمساعدتك. اختر الطريقة المناسبة للحصول على الدعم.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Support Options */}
                <section className="py-16">
                    <div className="container mx-auto px-6 lg:px-12 max-w-[1400px]">
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {supportOptions.map((option, index) => (
                                <Link
                                    key={index}
                                    href={option.href}
                                    className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg hover:border-accent transition-all group"
                                >
                                    <div className={`w-14 h-14 rounded-2xl ${option.color} flex items-center justify-center mb-4`}>
                                        <option.icon className="w-7 h-7 text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-accent transition-colors">
                                        {option.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm">{option.description}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Working Hours */}
                <section className="py-12 bg-white">
                    <div className="container mx-auto px-6 lg:px-12 max-w-[1400px]">
                        <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-center md:text-right">
                            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                                <Clock className="w-8 h-8 text-accent" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-1">
                                    ساعات عمل الدعم الفني
                                </h2>
                                <p className="text-gray-600">
                                    الأحد - الخميس، من الساعة 8:00 صباحاً حتى 4:00 مساءً
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Common Issues */}
                <section className="py-16">
                    <div className="container mx-auto px-6 lg:px-12 max-w-[1400px]">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                حلول المشاكل الشائعة
                            </h2>
                            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                                جرب هذه الحلول قبل التواصل مع الدعم الفني
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {commonIssues.map((issue, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-2xl p-6 border border-gray-200"
                                >
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                                        {issue.title}
                                    </h3>
                                    <ul className="space-y-3">
                                        {issue.solutions.map((solution, sIndex) => (
                                            <li key={sIndex} className="flex items-start gap-3">
                                                <span className="w-6 h-6 rounded-full bg-accent/10 text-accent text-sm font-bold flex items-center justify-center flex-shrink-0">
                                                    {sIndex + 1}
                                                </span>
                                                <span className="text-gray-600">{solution}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Resources */}
                <section className="py-16 bg-white">
                    <div className="container mx-auto px-6 lg:px-12 max-w-[1400px]">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                موارد مفيدة
                            </h2>
                            <p className="text-gray-600 text-lg">
                                مصادر إضافية لمساعدتك في استخدام المنصة
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                            {resources.map((resource, index) => (
                                <Link
                                    key={index}
                                    href={resource.href}
                                    className="flex items-center gap-4 p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors group"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                                        <resource.icon className="w-6 h-6 text-accent" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 group-hover:text-accent transition-colors">
                                            {resource.title}
                                        </h3>
                                        <p className="text-sm text-gray-600">{resource.description}</p>
                                    </div>
                                    <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-accent transition-colors" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-16">
                    <div className="container mx-auto px-6 lg:px-12 max-w-[1400px]">
                        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-8 md:p-12 text-white text-center">
                            <h2 className="text-2xl md:text-3xl font-bold mb-4">
                                لم تجد ما تبحث عنه؟
                            </h2>
                            <p className="text-gray-200 mb-8 max-w-xl mx-auto">
                                فريقنا جاهز لمساعدتك. لا تتردد في التواصل معنا.
                            </p>
                            <Link href="/contact">
                                <Button size="lg" variant="secondary">
                                    تواصل مع الدعم الفني
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
