import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { GraduationCap, Users, Award, FileText, Target, Lightbulb, CheckCircle, Handshake, Building2 } from "lucide-react";
import Image from "next/image";

export const metadata: Metadata = {
    title: "عن المعهد | معهد البحوث والدراسات الاستشارية",
    description: "تعرف على معهد البحوث والدراسات الاستشارية بالجامعة السعودية الإلكترونية - الذراع الاستثماري للجامعة والجهة التعاقدية للعمل مع القطاعات العامة والخاصة.",
    openGraph: {
        title: "عن المعهد | معهد البحوث والدراسات - SEU",
        description: "معهد البحوث والدراسات الاستشارية - الذراع الاستثماري للجامعة السعودية الإلكترونية",
        type: "website",
    },
};

const stats = [
    { icon: Users, value: "63", label: "مستشار" },
    { icon: GraduationCap, value: "72", label: "برنامج تدريبي" },
    { icon: Award, value: "6,000+", label: "متدرب" },
    { icon: FileText, value: "104", label: "عقد جديد" },
];

const values = [
    {
        icon: Award,
        title: "التميز",
        description: "نلتزم بأعلى معايير الجودة في تقديم خدماتنا البحثية والاستشارية والتدريبية",
    },
    {
        icon: Lightbulb,
        title: "الابتكار",
        description: "نوظف أحدث المنهجيات والحلول الرقمية لتلبية احتياجات شركائنا",
    },
    {
        icon: CheckCircle,
        title: "النزاهة",
        description: "نعمل بشفافية ومصداقية في جميع تعاملاتنا مع الشركاء والعملاء",
    },
    {
        icon: Handshake,
        title: "التعاون",
        description: "نبني شراكات استراتيجية مع أفضل المؤسسات المحلية والدولية",
    },
];

const services = [
    "تقديم الدراسات والبحوث التطبيقية",
    "الخدمات الاستشارية المتخصصة",
    "برامج التدريب والتطوير المهني",
    "الحلول الرقمية والتقنية",
    "دعم الكفاءة المؤسسية",
    "خدمات المعرفة المتخصصة",
];

const partners = [
    "Ohio University",
    "Deloitte",
    "PwC",
    "Roland Berger",
    "Strategy&",
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
                                معهد البحوث والدراسات الاستشارية
                            </h1>
                            <p className="text-xl text-gray-200 leading-relaxed">
                                الذراع الاستثماري للجامعة السعودية الإلكترونية والجهة التعاقدية
                                للعمل مع القطاعات العامة والخاصة والثالث، نسعى لتقديم حلول مبتكرة
                                تدعم التنمية الوطنية وتحقيق أهداف رؤية 2030.
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
                                    الخيار الأول للقطاعات في تقديم البحوث والدراسات والاستشارات
                                    وخدمات التدريب والحلول الرقمية.
                                </p>
                            </div>
                            <div className="bg-white rounded-3xl p-8 md:p-10 border border-gray-200">
                                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
                                    <Lightbulb className="w-7 h-7 text-accent" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">رسالتنا</h2>
                                <p className="text-gray-600 leading-relaxed text-lg">
                                    تقديم الدراسات والخدمات الاستشارية والتعليمية والتدريبية
                                    التي تلبي احتياجات القطاعات المختلفة وتساهم في تحقيق
                                    أهداف التنمية الوطنية.
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

                {/* Services */}
                <section className="py-20">
                    <div className="container mx-auto px-6 lg:px-12 max-w-[1400px]">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                                    خدماتنا
                                </h2>
                                <p className="text-gray-600 text-lg mb-8">
                                    نقدم مجموعة متكاملة من الخدمات البحثية والاستشارية والتدريبية
                                    التي تلبي احتياجات القطاعات المختلفة.
                                </p>
                                <ul className="space-y-4">
                                    {services.map((service, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <CheckCircle className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-700">{service}</span>
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

                {/* Partners */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-6 lg:px-12 max-w-[1400px]">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">شركاؤنا</h2>
                            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                                نفخر بشراكاتنا الاستراتيجية مع نخبة من المؤسسات العالمية الرائدة
                            </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-8">
                            {partners.map((partner, index) => (
                                <div
                                    key={index}
                                    className="px-8 py-4 bg-gray-50 rounded-xl text-gray-700 font-medium"
                                >
                                    {partner}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* About SEU */}
                <section className="py-20 bg-primary text-white">
                    <div className="container mx-auto px-6 lg:px-12 max-w-[1400px]">
                        <div className="max-w-3xl mx-auto text-center">
                            <Building2 className="w-16 h-16 mx-auto mb-6 opacity-75" />
                            <h2 className="text-3xl font-bold mb-6">عن الجامعة السعودية الإلكترونية</h2>
                            <p className="text-gray-200 text-lg leading-relaxed mb-8">
                                الجامعة السعودية الإلكترونية هي مؤسسة حكومية للتعليم العالي
                                تقدم التعليم العالي والتعلم مدى الحياة. تأسست بموجب المرسوم
                                الملكي الكريم رقم 37409 بتاريخ 10/9/1432هـ، وتعد من
                                المؤسسات التعليمية الرائدة في مجال التعلم الإلكتروني والتعليم المدمج.
                            </p>
                            <a
                                href="https://seu.edu.sa/ar/institutes/research-and-studies/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-accent hover:text-accent-light transition-colors"
                            >
                                زيارة صفحة المعهد
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
