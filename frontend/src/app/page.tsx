"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, ArrowLeft, GraduationCap, Users, CreditCard, Shield, TrendingUp, Clock, CheckCircle, Loader2, Briefcase, Rocket, BarChart3, Code, Lightbulb, Target, Building2, LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useState, useEffect } from "react";
import { catalogService } from "@/services/catalog";
import { Program } from "@/services/catalog/types";
import { ProgramCard } from "@/components/catalog";

// Helper function to get category-based styling using SEU brand colors
const SEU_COLORS = {
  cyan: '#32B7A8',
  blue: '#0083BE',
  purple: '#593888',
  navy: '#111E4D',
  orange: '#FFA300',
  lime: '#C4D600',
};

function getCategoryStyle(categorySlug: string | undefined): {
  gradientStyle: React.CSSProperties;
  icon: LucideIcon;
} {
  const styleMap: Record<string, { gradientStyle: React.CSSProperties; icon: LucideIcon }> = {
    'technology': {
      gradientStyle: { background: `linear-gradient(135deg, ${SEU_COLORS.cyan}, ${SEU_COLORS.blue}, ${SEU_COLORS.purple})` },
      icon: Code,
    },
    'تقنية': {
      gradientStyle: { background: `linear-gradient(135deg, ${SEU_COLORS.cyan}, ${SEU_COLORS.blue}, ${SEU_COLORS.purple})` },
      icon: Code,
    },
    'business': {
      gradientStyle: { background: `linear-gradient(135deg, ${SEU_COLORS.orange}, ${SEU_COLORS.lime})` },
      icon: Building2,
    },
    'إدارة': {
      gradientStyle: { background: `linear-gradient(135deg, ${SEU_COLORS.orange}, ${SEU_COLORS.lime})` },
      icon: Building2,
    },
    'management': {
      gradientStyle: { background: `linear-gradient(135deg, ${SEU_COLORS.purple}, ${SEU_COLORS.blue}, ${SEU_COLORS.navy})` },
      icon: Target,
    },
    'development': {
      gradientStyle: { background: `linear-gradient(135deg, ${SEU_COLORS.lime}, ${SEU_COLORS.cyan}, ${SEU_COLORS.blue})` },
      icon: Lightbulb,
    },
    'تطوير': {
      gradientStyle: { background: `linear-gradient(135deg, ${SEU_COLORS.lime}, ${SEU_COLORS.cyan}, ${SEU_COLORS.blue})` },
      icon: Lightbulb,
    },
  };

  return styleMap[categorySlug || ''] || {
    gradientStyle: { background: `linear-gradient(135deg, ${SEU_COLORS.cyan}, ${SEU_COLORS.blue}, ${SEU_COLORS.purple})` },
    icon: GraduationCap,
  };
}

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
              <span className="text-sm font-medium">التعليم التنفيذي -  معهد البحوث والدراسات</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              التعليم التنفيذي
              <span className="text-accent block mt-2">والتطوير المهني</span>
            </h1>

            <p className="text-xl text-gray-200 mb-6 leading-relaxed">
              برامج تعليمية وتدريبية متخصصة معتمدة من  معهد البحوث والدراسات بالجامعة السعودية الإلكترونية.
              طوّر مهاراتك القيادية والمهنية مع نخبة من الخبراء المتخصصين.
            </p>

            {/* Platform Capabilities */}
            <div className="flex flex-wrap items-center gap-6 mb-8 text-white/90">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-accent" />
                </div>
                <span className="text-sm">شهادات معتمدة</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-accent" />
                </div>
                <span className="text-sm">تعلم مرن عن بُعد</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-accent" />
                </div>
                <span className="text-sm">دفع آمن ومرن</span>
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
                    aria-label="ابحث عن برنامج تدريبي"
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

          {/* Platform Features Grid - Replaces fake stats */}
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
                    { icon: GraduationCap, title: "شهادات معتمدة", desc: "من الجامعة السعودية الإلكترونية" },
                    { icon: CreditCard, title: "دفع مرن", desc: "سداد، تابي، تمارا" },
                    { icon: TrendingUp, title: "تعلم من أي مكان", desc: "منصة تعليمية متطورة" },
                    { icon: Users, title: "خبراء متخصصون", desc: "مدربون ذوو خبرة عملية" },
                  ].map((feature, i) => (
                    <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-lg font-bold text-white mb-1">{feature.title}</div>
                      <div className="text-sm text-gray-300">{feature.desc}</div>
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
      description: "جميع برامج التعليم التنفيذي المعتمدة من الجامعة السعودية الإلكترونية في منصة واحدة سهلة الاستخدام.",
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
      description: "ادفع بأمان عبر سداد أو بطاقات الائتمان. خيارات تقسيط عبر تابي وتمارا.",
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
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">
              لماذا التعليم التنفيذي؟
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              نقدم تجربة تعليمية متكاملة تجمع بين الجودة الأكاديمية والمرونة الرقمية
            </p>
          </motion.div>
        </div>

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
      description: "تصفح البرامج التعليمية واختر ما يناسب أهدافك المهنية"
    },
    {
      number: "٢",
      title: "سجّل وادفع",
      description: "أنشئ حسابك وأكمل عملية الدفع بطريقة آمنة وسهلة"
    },
    {
      number: "٣",
      title: "ابدأ التعلم",
      description: "ادخل إلى منصة التعلم وابدأ رحلتك التعليمية"
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
              أربع خطوات بسيطة لبدء رحلتك التعليمية
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Featured Programs Section - Now fetches from API
function FeaturedPrograms() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPrograms() {
      try {
        // Use proper featured programs endpoint
        const featuredPrograms = await catalogService.getFeaturedPrograms(6);
        setPrograms(featuredPrograms);
      } catch (error) {
        console.error('Error fetching featured programs:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPrograms();
  }, []);

  // Don't show section if no programs
  if (!isLoading && programs.length === 0) {
    return null;
  }

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
              اكتشف برامج التعليم التنفيذي المعتمدة
            </motion.p>
          </div>
          <Link href="/programs" className="hidden md:block">
            <Button variant="outline" className="gap-2">
              عرض الكل
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programs.map((program, index) => (
              <ProgramCard key={program.id} program={program} index={index} />
            ))}
          </div>
        )}

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
            ابدأ رحلتك في التطوير المهني
          </h2>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            استثمر في مستقبلك المهني مع برامج التعليم التنفيذي المعتمدة من الجامعة السعودية الإلكترونية
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/programs">
              <Button size="lg" className="bg-accent hover:bg-accent-light text-white text-lg px-10">
                تصفح البرامج
              </Button>
            </Link>
            <Link href="/register">
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

// Target Audience Section
function TargetAudience() {
  const audiences = [
    {
      icon: Briefcase,
      title: "المدراء التنفيذيون",
      description: "قادة يسعون لتطوير مهاراتهم القيادية والإستراتيجية",
      color: "text-primary"
    },
    {
      icon: Rocket,
      title: "رواد الأعمال",
      description: "مؤسسون ومديرو مشاريع يريدون النمو والتوسع",
      color: "text-accent"
    },
    {
      icon: BarChart3,
      title: "الباحثون عن التطوير",
      description: "موظفون يتطلعون للارتقاء في مسيرتهم المهنية",
      color: "text-primary"
    }
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-6 lg:px-12 max-w-[1400px]">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">
              لمن هذه البرامج؟
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              برامج مصممة خصيصاً لتلبية احتياجات التطوير المهني
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {audiences.map((audience, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-6">
                <audience.icon className={`w-10 h-10 ${audience.color}`} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{audience.title}</h3>
              <p className="text-gray-600">{audience.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Main Homepage
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <WhySEU />
        <HowItWorks />
        <FeaturedPrograms />
        <TargetAudience />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
