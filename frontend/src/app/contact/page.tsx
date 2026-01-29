"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

// Metadata is handled in layout or head for client components
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, Loader2 } from "lucide-react";

const contactInfo = [
    {
        icon: Phone,
        title: "الهاتف",
        value: "0112613789",
        description: "الأحد - الخميس، 8 ص - 4 م",
    },
    {
        icon: Mail,
        title: "البريد الإلكتروني",
        value: "INFO.RSI@seu.edu.sa",
        description: "نرد خلال 24 ساعة",
    },
    {
        icon: MapPin,
        title: "العنوان",
        value: "الرياض، المملكة العربية السعودية",
        description: "معهد البحوث والدراسات - الجامعة السعودية الإلكترونية",
    },
    {
        icon: Clock,
        title: "ساعات العمل",
        value: "8:00 ص - 4:00 م",
        description: "الأحد - الخميس",
    },
];

const subjects = [
    { value: "general", label: "استفسار عام" },
    { value: "registration", label: "استفسار عن التسجيل" },
    { value: "payment", label: "استفسار عن الدفع" },
    { value: "certificates", label: "استفسار عن الشهادات" },
    { value: "corporate", label: "تدريب مؤسسي / B2B" },
    { value: "partnership", label: "شراكات وتعاون" },
    { value: "complaint", label: "شكوى أو اقتراح" },
];

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone || undefined,
                    subject: formData.subject.toUpperCase(), // API expects enum value
                    message: formData.message,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "فشل إرسال الرسالة");
            }

            setIsSubmitted(true);
            setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
        } catch (err) {
            const message = err instanceof Error ? err.message : "حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.";
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="bg-gradient-to-br from-primary to-primary-dark text-white py-16">
                    <div className="container mx-auto px-6 lg:px-12 max-w-[1400px]">
                        <div className="max-w-3xl">
                            <h1 className="text-4xl md:text-5xl font-bold mb-6">تواصل معنا</h1>
                            <p className="text-xl text-gray-200">
                                نسعد بتواصلك معنا. فريقنا جاهز للإجابة على استفساراتك ومساعدتك.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Contact Info Cards */}
                <section className="py-12 bg-white">
                    <div className="container mx-auto px-6 lg:px-12 max-w-[1400px]">
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {contactInfo.map((info, index) => (
                                <div
                                    key={index}
                                    className="bg-gray-50 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow"
                                >
                                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-accent/10 flex items-center justify-center">
                                        <info.icon className="w-7 h-7 text-accent" />
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-1">{info.title}</h3>
                                    <p className="text-lg font-medium text-primary mb-1">{info.value}</p>
                                    <p className="text-sm text-gray-500">{info.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Contact Form */}
                <section className="py-16">
                    <div className="container mx-auto px-6 lg:px-12 max-w-[800px]">
                        <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-200">
                            <div className="text-center mb-10">
                                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                                    أرسل لنا رسالة
                                </h2>
                                <p className="text-gray-600">
                                    املأ النموذج أدناه وسنتواصل معك في أقرب وقت
                                </p>
                            </div>

                            {isSubmitted ? (
                                <div className="text-center py-12">
                                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                                        <CheckCircle className="w-10 h-10 text-green-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                        تم استلام رسالتك بنجاح
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        شكراً لتواصلك معنا. سنرد عليك في أقرب وقت ممكن.
                                    </p>
                                    <Button onClick={() => setIsSubmitted(false)}>
                                        إرسال رسالة أخرى
                                    </Button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                                الاسم الكامل *
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                required
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                                                placeholder="أدخل اسمك الكامل"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                                البريد الإلكتروني *
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                required
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                                                placeholder="example@email.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                                رقم الجوال
                                            </label>
                                            <input
                                                type="tel"
                                                id="phone"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                                                placeholder="05xxxxxxxx"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                                                الموضوع *
                                            </label>
                                            <select
                                                id="subject"
                                                name="subject"
                                                required
                                                value={formData.subject}
                                                onChange={handleChange}
                                                className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all bg-white"
                                            >
                                                <option value="">اختر الموضوع</option>
                                                {subjects.map((subject) => (
                                                    <option key={subject.value} value={subject.value}>
                                                        {subject.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                            الرسالة *
                                        </label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            required
                                            rows={5}
                                            value={formData.message}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all resize-none"
                                            placeholder="اكتب رسالتك هنا..."
                                        />
                                    </div>

                                    {error && (
                                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                                            {error}
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        size="lg"
                                        className="w-full"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                                                جاري الإرسال...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5 ml-2" />
                                                إرسال الرسالة
                                            </>
                                        )}
                                    </Button>
                                </form>
                            )}
                        </div>
                    </div>
                </section>

                {/* Map Section */}
                <section className="py-16 bg-white">
                    <div className="container mx-auto px-6 lg:px-12 max-w-[1400px]">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">موقعنا</h2>
                            <p className="text-gray-600">معهد البحوث والدراسات الاستشارية - الرياض</p>
                        </div>
                        <div className="rounded-3xl overflow-hidden h-[400px] bg-gray-200">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3625.1!2d46.6841976!3d24.777492!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2ee3002df9fab9%3A0x13db0a362846df55!2z2YXYudi52K8g2KfZhNio2K3ZiNirINmI2KfZhNiv2LHYp9iz2KfYqiDYqNin2YTYrNin2YXYudipINin2YTYs9i52YjYr9mK2Kkg2KfZhNin2YTZg9iq2LHZiNmG2YrYqQ!5e0!3m2!1sar!2ssa!4v1706500000000!5m2!1sar!2ssa"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="موقع معهد البحوث والدراسات الاستشارية"
                            />
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
