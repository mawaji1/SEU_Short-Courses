"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, ArrowLeft, GraduationCap, Users, CreditCard, Shield, TrendingUp, Clock } from "lucide-react";
import { motion } from "framer-motion";

// Hero Section
function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-primary via-primary-dark to-primary overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-6 lg:px-12 max-w-[1400px] py-16 lg:py-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span className="text-sm font-medium">التعليم التنفيذي - الجامعة السعودية الإلكترونية</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              طوّر مهاراتك المهنية
              <span className="text-accent block mt-2">مع خبراء معتمدين</span>
            </h1>

            <p className="text-xl text-gray-200 mb-6 leading-relaxed">
              برامج تدريبية احترافية معتمدة من الجامعة السعودية الإلكترونية. تعلم عن بُعد واحصل على شهادة موثقة تعزز مسيرتك المهنية.
            </p>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 mb-8 text-white/90">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                  <span className="text-accent font-bold">✓</span>
                </div>
                <span className="text-sm">شهادات معتمدة</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                  <span className="text-accent font-bold">✓</span>
                </div>
                <span className="text-sm">مدربون خبراء</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                  <span className="text-accent font-bold">✓</span>
                </div>
                <span className="text-sm">دفع آمن عبر سداد</span>
              </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-2xl p-2 shadow-2xl mb-8 max-w-2xl">
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-3 px-4">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="ابحث عن برنامج تدريبي..."
                    className="flex-1 py-3 outline-none text-gray-900 placeholder:text-gray-400"
                  />
                </div>
                <Link href="/programs">
                  <Button size="lg" className="gap-2">
                    ابحث الآن
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link href="/programs">
                <Button size="lg" className="gap-2 text-lg px-8">
                  استكشف البرامج
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white hover:text-primary text-lg px-8">
                  كيف تعمل المنصة؟
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:block"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent rounded-3xl blur-2xl" />
              <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: "📚", title: "برنامج تدريبي", value: "50+" },
                    { icon: "🎓", title: "مدرب خبير", value: "30+" },
                    { icon: "👥", title: "متدرب مسجل", value: "5,000+" },
                    { icon: "⭐", title: "تقييم المتدربين", value: "4.9" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                      <div className="text-3xl mb-2">{stat.icon}</div>
                      <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                      <div className="text-sm text-gray-300">{stat.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Why SEU Section
function WhySEU() {
  const benefits = [
    {
      icon: Search,
      title: "اكتشف جميع البرامج في مكان واحد",
      description: "جميع البرامج التدريبية المعتمدة من الجامعة السعودية الإلكترونية في منصة واحدة سهلة الاستخدام.",
      color: "text-accent"
    },
    {
      icon: Users,
      title: "تعلم من خبراء معتمدين",
      description: "مدربون ذوو خبرة عملية وأكاديمية يقدمون محتوى عالي الجودة ودعم مستمر.",
      color: "text-primary"
    },
    {
      icon: CreditCard,
      title: "دفع إلكتروني آمن ومرن",
      description: "ادفع بأمان عبر سداد أو by بطاقات الائتمان. خيارات تقسيط عبر تابي وتمارا.",
      color: "text-accent"
    },
    {
      icon: GraduationCap,
      title: "تعلم في أي وقت ومكان",
      description: "منصة تعليمية متطورة تتيح لك التعلم بمرونة كاملة من أي جهاز.",
      color: "text-primary"
    },
    {
      icon: Shield,
      title: "شهادات معتمدة رسمياً",
      description: "احصل على شهادات رقمية معتمدة من الجامعة السعودية الإلكترونية.",
      color: "text-accent"
    },
    {
      icon: TrendingUp,
      title: "تطوير مهني مستمر",
      description: "برامج مصممة للعاملين والباحثين عن التطوير المهني دون ترك وظيفتك.",
      color: "text-primary"
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-12 max-w-[1400px]">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">
              لماذا التدريب مع SEU؟
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              نقدم تجربة تدريبية متكاملة تجمع بين الجودة الأكاديمية والمرونة الرقمية
            </p>
          </motion.div>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="h-full bg-gray-50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${benefit.color === 'text-accent' ? 'from-accent/10 to-accent/5' : 'from-primary/10 to-primary/5'} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <benefit.icon className={`w-8 h-8 ${benefit.color}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// How It Works Section
function HowItWorks() {
  const steps = [
    {
      number: "١",
      title: "اختر برنامجك",
      description: "تصفح البرامج التدريبية واختر ما يناسب أهدافك المهنية"
    },
    {
      number: "٢",
      title: "سجّل وادفع",
      description: "أنشئ حسابك وأكمل عملية الدفع بطريقة آمنة وسهلة"
    },
    {
      number: "٣",
      title: "ابدأ التعلم",
      description: "ادخل إلى منصة التعلم وابدأ رحلتك التدريبية"
    },
    {
      number: "٤",
      title: "احصل على شهادتك",
      description: "أكمل البرنامج واحصل على شهادة معتمدة"
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-gray-50">
      <div className="container mx-auto px-6 lg:px-12 max-w-[1400px]">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">
              كيف تعمل المنصة؟
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              أربع خطوات بسيطة لبدء رحلتك التدريبية
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative text-center"
            >
              <div className="w-20 h-20 rounded-full bg-primary text-white text-3xl font-bold flex items-center justify-center mx-auto mb-6">
                {step.number}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-0 w-full h-0.5 bg-gray-200 -translate-x-1/2" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Featured Programs Section
function FeaturedPrograms() {
  const programs = [
    {
      title: "إدارة المشاريع الاحترافية PMP",
      category: "الإدارة",
      duration: "8 أسابيع",
      price: "2,500 ر.س"
    },
    {
      title: "تحليل البيانات باستخدام Python",
      category: "التقنية",
      duration: "6 أسابيع",
      price: "1,800 ر.س"
    },
    {
      title: "القيادة والذكاء العاطفي",
      category: "التطوير الذاتي",
      duration: "4 أسابيع",
      price: "1,200 ر.س"
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-12 max-w-[1400px]">
        <div className="flex items-center justify-between mb-12">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-2"
            >
              البرامج المميزة
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-600"
            >
              اكتشف أكثر البرامج التدريبية طلباً
            </motion.p>
          </div>
          <Link href="/programs" className="hidden md:block">
            <Button variant="outline" className="gap-2">
              عرض الكل
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {programs.map((program, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="h-48 bg-gradient-to-br from-primary/10 to-accent/10" />
                <div className="p-6">
                  <span className="text-sm font-medium text-accent">{program.category}</span>
                  <h3 className="text-xl font-bold text-gray-900 mt-2 mb-4">{program.title}</h3>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {program.duration}
                    </div>
                    <span className="font-bold text-primary">{program.price}</span>
                  </div>
                  <Button className="w-full">سجل الآن</Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link href="/programs">
            <Button className="gap-2 w-full sm:w-auto">
              عرض جميع البرامج
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// CTA Section
function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-br from-primary via-primary-dark to-primary text-white">
      <div className="container mx-auto px-6 lg:px-12 max-w-[1400px] text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            ابدأ رحلتك التدريبية اليوم
          </h2>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            انضم إلى آلاف المتدربين الذين طوروا مهاراتهم مع الجامعة السعودية الإلكترونية
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/programs">
              <Button size="lg" className="bg-accent hover:bg-accent-light text-white text-lg px-10">
                تصفح البرامج
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary text-lg px-10">
                إنشاء حساب
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Main Page Component
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function TestDesignPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <WhySEU />
        <HowItWorks />
        <FeaturedPrograms />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
