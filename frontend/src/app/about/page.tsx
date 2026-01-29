import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { GraduationCap, Users, Award, Globe, Target, Lightbulb, CheckCircle } from "lucide-react";
import Image from "next/image";

export const metadata: Metadata = {
    title: "عن المنصة | التعليم التنفيذي - الجامعة السعودية الإلكترونية",
    description: "تعرف على منصة التعليم التنفيذي بالجامعة السعودية الإلكترونية - رؤيتنا ورسالتنا وأهدافنا في تقديم برامج تدريبية معتمدة لتطوير الكفاءات المهنية.",
    openGraph: {
        title: "عن المنصة | التعليم التنفيذي - SEU",
        description: "منصة التعليم التنفيذي بالجامعة السعودية الإلكترونية - برامج تدريبية معتمدة لتطوير المهارات المهنية",
        type: "website",
    },
};

const stats = [
    { icon: Users, value: "10,000+", label: "متدرب" },
    { icon: GraduationCap, value: "50+", label: "برنامج تدريبي" },
    { icon: Award, value: "95%", label: "نسبة الرضا" },
    { icon: Globe, value: "13", label: "منطقة" },
];

const values = [
    {
        icon: Target,
        title: "الجودة",
        description: "نلتزم بأعلى معايير الجودة في تصميم وتقديم البرامج التدريبية",
    },
    {
        icon: Lightbulb,
        title: "الابتكار",
        description: "نوظف أحدث التقنيات والأساليب التعليمية لتقديم تجربة تعلم متميزة",
    },
    {
        icon: Users,
        title: "الشراكة",
        description: "نعمل مع أفضل الخبراء والمؤسسات لضمان مواكبة متطلبات سوق العمل",
    },
    {
        icon: Award,
        title: "التميز",
        description: "نسعى دائماً لتحقيق التميز في كل ما نقدمه من برامج وخدمات",
    },
];

const features = [
    "شهادات معتمدة من الجامعة السعودية الإلكترونية",
    "مدربون خبراء ومعتمدون دولياً",
    "مرونة في التعلم - حضوري أو عن بُعد",
    "محتوى تدريبي محدث ومواكب لسوق العمل",
    "دعم فني متواصل طوال فترة التدريب",
    "شبكة خريجين واسعة للتواصل المهني",
];

export default function AboutPage() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="bg-gradient-to-br from-primary to-primary-dark text-white py-20">
                    <div className="container mx-auto px-6 lg:px-12 max-w-[1400px]">
                        <div className="max-w-3xl">
                            <h1 className="text-4xl md:text-5xl font-bold mb-6">
                                عن منصة التعليم التنفيذي
                            </h1>
                            <p className="text-xl text-gray-200 leading-relaxed">
                                منصة التعليم التنفيذي هي المنصة الرسمية للجامعة السعودية الإلكترونية
                                لتقديم برامج التطوير المهني والتدريب التنفيذي المعتمدة،
                                بهدف تمكين الكوادر الوطنية وتطوير مهاراتهم لمواكبة متطلبات سوق العمل.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-16 bg-white">
                    <div className="container mx-auto px-6 lg:px-12 max-w-[1400px]">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent/10 flex items-center justify-center">
                                        <stat.icon className="w-8 h-8 text-accent" />
                                    </div>
                                    <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                                        {stat.value}
                                    </div>
                                    <div className="text-gray-600">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Vision & Mission */}
                <section className="py-20">
                    <div className="container mx-auto px-6 lg:px-12 max-w-[1400px]">
                        <div className="grid md:grid-cols-2 gap-12">
                            <div className="bg-white rounded-3xl p-8 md:p-10 border border-gray-200">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                                    <Target className="w-7 h-7 text-primary" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">رؤيتنا</h2>
                                <p className="text-gray-600 leading-relaxed text-lg">
                                    أن نكون المنصة الرائدة في التعليم التنفيذي والتطوير المهني
                                    في المملكة العربية السعودية والمنطقة، ونساهم في تحقيق رؤية
                                    المملكة 2030 من خلال بناء كوادر وطنية مؤهلة ومنافسة عالمياً.
                                </p>
                            </div>
                            <div className="bg-white rounded-3xl p-8 md:p-10 border border-gray-200">
                                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
                                    <Lightbulb className="w-7 h-7 text-accent" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">رسالتنا</h2>
                                <p className="text-gray-600 leading-relaxed text-lg">
                                    تقديم برامج تدريبية وتطويرية عالية الجودة تلبي احتياجات
                                    سوق العمل، وتمكن المتدربين من اكتساب المهارات والمعارف
                                    اللازمة للتميز في مسيرتهم المهنية.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Values */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-6 lg:px-12 max-w-[1400px]">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">قيمنا</h2>
                            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                                نؤمن بمجموعة من القيم الأساسية التي توجه عملنا وتشكل هويتنا
                            </p>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {values.map((value, index) => (
                                <div
                                    key={index}
                                    className="bg-gray-50 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow"
                                >
                                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-accent/10 flex items-center justify-center">
                                        <value.icon className="w-7 h-7 text-accent" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        {value.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm">{value.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Why Choose Us */}
                <section className="py-20">
                    <div className="container mx-auto px-6 lg:px-12 max-w-[1400px]">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                                    لماذا تختار التعليم التنفيذي؟
                                </h2>
                                <p className="text-gray-600 text-lg mb-8">
                                    نقدم لك تجربة تعليمية متكاملة تجمع بين الجودة الأكاديمية
                                    والتطبيق العملي، مع مرونة تناسب جدولك المهني.
                                </p>
                                <ul className="space-y-4">
                                    {features.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <CheckCircle className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="relative">
                                <div className="aspect-square bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl flex items-center justify-center">
                                    <Image
                                        src="/images/seu-header-logo.svg"
                                        alt="الجامعة السعودية الإلكترونية"
                                        width={200}
                                        height={200}
                                        className="opacity-50"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* About SEU */}
                <section className="py-20 bg-primary text-white">
                    <div className="container mx-auto px-6 lg:px-12 max-w-[1400px]">
                        <div className="max-w-3xl mx-auto text-center">
                            <h2 className="text-3xl font-bold mb-6">عن الجامعة السعودية الإلكترونية</h2>
                            <p className="text-gray-200 text-lg leading-relaxed mb-8">
                                الجامعة السعودية الإلكترونية هي مؤسسة حكومية للتعليم العالي
                                تقدم التعليم العالي والتعلم مدى الحياة. تأسست بموجب المرسوم
                                الملكي الكريم رقم 37409 بتاريخ 10/9/1432هـ، وتعد من
                                المؤسسات التعليمية الرائدة في مجال التعلم الإلكتروني والتعليم المدمج.
                            </p>
                            <a
                                href="https://seu.edu.sa"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-accent hover:text-accent-light transition-colors"
                            >
                                زيارة موقع الجامعة
                                <Globe className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
