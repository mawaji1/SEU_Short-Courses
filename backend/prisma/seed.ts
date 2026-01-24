/**
 * Seed Script for SEU Short Courses Platform
 * 
 * This creates production-quality test data for development and testing.
 * Run with: npx prisma db seed
 */

import { PrismaClient, ProgramStatus, ProgramType, DeliveryMode, CohortStatus, UserRole, PromoCodeType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // =========================================================================
    // 1. CATEGORIES
    // =========================================================================
    console.log('📁 Creating categories...');

    const categories = await Promise.all([
        prisma.category.upsert({
            where: { slug: 'technology' },
            update: {},
            create: {
                nameAr: 'التقنية والبرمجة',
                nameEn: 'Technology & Programming',
                slug: 'technology',
                sortOrder: 1,
            },
        }),
        prisma.category.upsert({
            where: { slug: 'business' },
            update: {},
            create: {
                nameAr: 'الأعمال والإدارة',
                nameEn: 'Business & Management',
                slug: 'business',
                sortOrder: 2,
            },
        }),
        prisma.category.upsert({
            where: { slug: 'health' },
            update: {},
            create: {
                nameAr: 'الصحة والطب',
                nameEn: 'Health & Medicine',
                slug: 'health',
                sortOrder: 3,
            },
        }),
        prisma.category.upsert({
            where: { slug: 'education' },
            update: {},
            create: {
                nameAr: 'التعليم والتدريب',
                nameEn: 'Education & Training',
                slug: 'education',
                sortOrder: 4,
            },
        }),
        prisma.category.upsert({
            where: { slug: 'law' },
            update: {},
            create: {
                nameAr: 'القانون والأنظمة',
                nameEn: 'Law & Regulations',
                slug: 'law',
                sortOrder: 5,
            },
        }),
    ]);

    console.log(`   ✅ Created ${categories.length} categories`);

    // =========================================================================
    // 2. INSTRUCTORS
    // =========================================================================
    console.log('👨‍🏫 Creating instructors...');

    const instructors = await Promise.all([
        prisma.instructor.create({
            data: {
                nameAr: 'د. أحمد محمد العتيبي',
                nameEn: 'Dr. Ahmed Mohammed Al-Otaibi',
                titleAr: 'أستاذ مشارك في علوم الحاسب',
                titleEn: 'Associate Professor of Computer Science',
                bioAr: 'خبرة أكثر من 15 عاماً في مجال الذكاء الاصطناعي وتعلم الآلة. حاصل على الدكتوراه من جامعة ستانفورد.',
                bioEn: 'Over 15 years of experience in AI and Machine Learning. PhD from Stanford University.',
                email: 'a.alotaibi@seu.edu.sa',
            },
        }),
        prisma.instructor.create({
            data: {
                nameAr: 'د. سارة خالد الشمري',
                nameEn: 'Dr. Sarah Khalid Al-Shammari',
                titleAr: 'خبيرة في التسويق الرقمي',
                titleEn: 'Digital Marketing Expert',
                bioAr: 'مستشارة تسويق رقمي مع خبرة 10 سنوات في السوق السعودي والخليجي.',
                bioEn: 'Digital marketing consultant with 10 years experience in Saudi and GCC markets.',
                email: 's.alshammari@seu.edu.sa',
            },
        }),
        prisma.instructor.create({
            data: {
                nameAr: 'د. محمد عبدالله القحطاني',
                nameEn: 'Dr. Mohammed Abdullah Al-Qahtani',
                titleAr: 'خبير في إدارة المشاريع',
                titleEn: 'Project Management Expert',
                bioAr: 'حاصل على شهادة PMP وخبرة 12 عاماً في إدارة المشاريع الكبرى.',
                bioEn: 'PMP certified with 12 years experience managing large-scale projects.',
                email: 'm.alqahtani@seu.edu.sa',
            },
        }),
        prisma.instructor.create({
            data: {
                nameAr: 'د. نورة فهد العنزي',
                nameEn: 'Dr. Noura Fahad Al-Enazi',
                titleAr: 'أخصائية في أمن المعلومات',
                titleEn: 'Information Security Specialist',
                bioAr: 'متخصصة في الأمن السيبراني مع شهادات CISSP و CEH.',
                bioEn: 'Cybersecurity specialist with CISSP and CEH certifications.',
                email: 'n.alenazi@seu.edu.sa',
            },
        }),
    ]);

    console.log(`   ✅ Created ${instructors.length} instructors`);

    // =========================================================================
    // 3. PROGRAMS
    // =========================================================================
    console.log('📚 Creating programs...');

    const techCategory = categories[0];
    const businessCategory = categories[1];

    const programs = await Promise.all([
        prisma.program.create({
            data: {
                titleAr: 'أساسيات الذكاء الاصطناعي',
                titleEn: 'AI Fundamentals',
                descriptionAr: 'دورة شاملة تغطي أساسيات الذكاء الاصطناعي وتطبيقاته العملية في بيئة الأعمال السعودية. تتضمن مشاريع عملية وحالات دراسية من الشركات المحلية.',
                descriptionEn: 'Comprehensive course covering AI fundamentals and practical applications in Saudi business environment. Includes hands-on projects and local case studies.',
                shortDescriptionAr: 'تعلم أساسيات الذكاء الاصطناعي وتطبيقاته العملية',
                shortDescriptionEn: 'Learn AI fundamentals and practical applications',
                slug: 'ai-fundamentals',
                type: ProgramType.COURSE,
                deliveryMode: DeliveryMode.ONLINE,
                durationHours: 40,
                price: new Decimal(2500),
                status: ProgramStatus.PUBLISHED,
                categoryId: techCategory.id,
                isFeatured: true,
                learningOutcomesAr: [
                    'فهم مبادئ الذكاء الاصطناعي',
                    'تطبيق تقنيات تعلم الآلة',
                    'بناء نماذج تنبؤية بسيطة',
                    'تحليل البيانات باستخدام Python',
                ],
                learningOutcomesEn: [
                    'Understand AI principles',
                    'Apply machine learning techniques',
                    'Build simple predictive models',
                    'Analyze data using Python',
                ],
                targetAudienceAr: 'المهتمين بالتقنية والمحللين ومدراء المشاريع',
                targetAudienceEn: 'Tech enthusiasts, analysts, and project managers',
            },
        }),
        prisma.program.create({
            data: {
                titleAr: 'التسويق الرقمي الاحترافي',
                titleEn: 'Professional Digital Marketing',
                descriptionAr: 'برنامج متكامل في التسويق الرقمي يشمل إعلانات جوجل وفيسبوك وتحسين محركات البحث والتسويق بالمحتوى.',
                descriptionEn: 'Complete digital marketing program covering Google Ads, Facebook Ads, SEO, and content marketing.',
                shortDescriptionAr: 'احترف التسويق الرقمي بأحدث الأساليب',
                shortDescriptionEn: 'Master digital marketing with latest techniques',
                slug: 'digital-marketing',
                type: ProgramType.CERTIFICATION,
                deliveryMode: DeliveryMode.HYBRID,
                durationHours: 60,
                price: new Decimal(3500),
                status: ProgramStatus.PUBLISHED,
                categoryId: businessCategory.id,
                isFeatured: true,
                learningOutcomesAr: [
                    'إنشاء حملات إعلانية ناجحة',
                    'تحسين ظهور المواقع في محركات البحث',
                    'إدارة وسائل التواصل الاجتماعي',
                    'قياس وتحليل أداء الحملات',
                ],
                learningOutcomesEn: [
                    'Create successful ad campaigns',
                    'Improve website SEO',
                    'Manage social media',
                    'Measure and analyze campaign performance',
                ],
            },
        }),
        prisma.program.create({
            data: {
                titleAr: 'إدارة المشاريع الاحترافية PMP',
                titleEn: 'Professional Project Management PMP',
                descriptionAr: 'برنامج تحضيري لاختبار PMP معتمد من معهد إدارة المشاريع PMI.',
                descriptionEn: 'PMP exam preparation program certified by PMI.',
                shortDescriptionAr: 'استعد لاختبار PMP بتوجيه خبراء معتمدين',
                shortDescriptionEn: 'Prepare for PMP exam with certified experts',
                slug: 'pmp-preparation',
                type: ProgramType.CERTIFICATION,
                deliveryMode: DeliveryMode.ONLINE,
                durationHours: 35,
                price: new Decimal(4000),
                status: ProgramStatus.PUBLISHED,
                categoryId: businessCategory.id,
                isFeatured: true,
            },
        }),
        prisma.program.create({
            data: {
                titleAr: 'الأمن السيبراني للمؤسسات',
                titleEn: 'Enterprise Cybersecurity',
                descriptionAr: 'دورة متخصصة في حماية البنية التحتية الرقمية للمؤسسات.',
                descriptionEn: 'Specialized course in protecting enterprise digital infrastructure.',
                shortDescriptionAr: 'احمِ مؤسستك من التهديدات السيبرانية',
                shortDescriptionEn: 'Protect your organization from cyber threats',
                slug: 'cybersecurity',
                type: ProgramType.COURSE,
                deliveryMode: DeliveryMode.ONLINE,
                durationHours: 30,
                price: new Decimal(2800),
                status: ProgramStatus.PUBLISHED,
                categoryId: techCategory.id,
                isFeatured: false,
            },
        }),
    ]);

    console.log(`   ✅ Created ${programs.length} programs`);

    // =========================================================================
    // 4. COHORTS
    // =========================================================================
    console.log('📅 Creating cohorts...');

    const now = new Date();
    const cohorts = await Promise.all([
        // AI Fundamentals cohorts
        prisma.cohort.create({
            data: {
                programId: programs[0].id,
                nameAr: 'الفوج الأول - يناير 2026',
                nameEn: 'Cohort 1 - January 2026',
                startDate: new Date('2026-01-15'),
                endDate: new Date('2026-02-15'),
                registrationStartDate: new Date('2025-12-01'),
                registrationEndDate: new Date('2026-01-10'),
                capacity: 30,
                enrolledCount: 25,
                status: CohortStatus.OPEN,
            },
        }),
        prisma.cohort.create({
            data: {
                programId: programs[0].id,
                nameAr: 'الموعد الثاني - فبراير 2026',
                nameEn: 'Cohort 2 - February 2026',
                startDate: new Date('2026-02-20'),
                endDate: new Date('2026-03-20'),
                registrationStartDate: new Date('2025-12-15'),
                registrationEndDate: new Date('2026-02-15'),
                capacity: 30,
                enrolledCount: 10,
                status: CohortStatus.OPEN,
            },
        }),
        prisma.cohort.create({
            data: {
                programId: programs[0].id,
                nameAr: 'الموعد الثالث - مارس 2026',
                nameEn: 'Cohort 3 - March 2026',
                startDate: new Date('2026-03-15'),
                endDate: new Date('2026-04-15'),
                registrationStartDate: new Date('2026-01-01'),
                registrationEndDate: new Date('2026-03-10'),
                capacity: 30,
                enrolledCount: 30,
                status: CohortStatus.FULL,
            },
        }),
        // Digital Marketing cohorts
        prisma.cohort.create({
            data: {
                programId: programs[1].id,
                nameAr: 'الموعد الأول - يناير 2026',
                nameEn: 'Cohort 1 - January 2026',
                startDate: new Date('2026-01-20'),
                endDate: new Date('2026-03-20'),
                registrationStartDate: new Date('2025-12-01'),
                registrationEndDate: new Date('2026-01-15'),
                capacity: 25,
                enrolledCount: 18,
                status: CohortStatus.OPEN,
            },
        }),
        // PMP cohorts
        prisma.cohort.create({
            data: {
                programId: programs[2].id,
                nameAr: 'الموعد الأول - فبراير 2026',
                nameEn: 'Cohort 1 - February 2026',
                startDate: new Date('2026-02-01'),
                endDate: new Date('2026-03-01'),
                registrationStartDate: new Date('2025-12-15'),
                registrationEndDate: new Date('2026-01-25'),
                capacity: 20,
                enrolledCount: 5,
                status: CohortStatus.OPEN,
            },
        }),
    ]);

    console.log(`   ✅ Created ${cohorts.length} cohorts`);

    // =========================================================================
    // 5. PROMO CODES
    // =========================================================================
    console.log('🎟️ Creating promo codes...');

    const promoCodes = await Promise.all([
        prisma.promoCode.create({
            data: {
                code: 'SEU20',
                type: PromoCodeType.PERCENTAGE,
                value: new Decimal(20),
                maxUses: 100,
                validFrom: new Date('2025-01-01'),
                validUntil: new Date('2026-12-31'),
            },
        }),
        prisma.promoCode.create({
            data: {
                code: 'WELCOME500',
                type: PromoCodeType.FIXED_AMOUNT,
                value: new Decimal(500),
                maxUses: 50,
                minPurchase: new Decimal(2000),
                validFrom: new Date('2025-01-01'),
                validUntil: new Date('2026-06-30'),
            },
        }),
        prisma.promoCode.create({
            data: {
                code: 'NEWYEAR25',
                type: PromoCodeType.PERCENTAGE,
                value: new Decimal(25),
                maxUses: 200,
                maxDiscount: new Decimal(1000),
                validFrom: new Date('2026-01-01'),
                validUntil: new Date('2026-01-31'),
            },
        }),
    ]);

    console.log(`   ✅ Created ${promoCodes.length} promo codes`);

    // =========================================================================
    // 6. TEST USERS
    // =========================================================================
    console.log('👤 Creating test users...');

    const passwordHash = await bcrypt.hash('Test@123', 10);

    const users = await Promise.all([
        prisma.user.upsert({
            where: { email: 'admin@seu.edu.sa' },
            update: {},
            create: {
                email: 'admin@seu.edu.sa',
                passwordHash,
                firstName: 'مدير',
                lastName: 'النظام',
                role: UserRole.ADMIN,
                emailVerified: true,
            },
        }),
        prisma.user.upsert({
            where: { email: 'learner@seu.edu.sa' },
            update: {},
            create: {
                email: 'learner@seu.edu.sa',
                passwordHash,
                firstName: 'محمد',
                lastName: 'المتدرب',
                role: UserRole.LEARNER,
                emailVerified: true,
            },
        }),
        prisma.user.upsert({
            where: { email: 'coordinator@seu.edu.sa' },
            update: {},
            create: {
                email: 'coordinator@seu.edu.sa',
                passwordHash,
                firstName: 'أحمد',
                lastName: 'المنسق',
                role: UserRole.CORPORATE_COORDINATOR,
                emailVerified: true,
            },
        }),
    ]);

    console.log(`   ✅ Created ${users.length} test users`);

    // =========================================================================
    // 7. LEARNER EXPERIENCE - ENROLLMENTS
    // =========================================================================
    console.log('🎓 Creating learner enrollments...');

    const learnerUser = users.find(u => u.email === 'learner@seu.edu.sa');
    if (!learnerUser) {
        throw new Error('Learner user not found');
    }

    // Get first two cohorts (AI and Digital Marketing)
    const allCohorts = await prisma.cohort.findMany({
        take: 2,
        orderBy: { createdAt: 'asc' },
    });

    // Create registrations and enrollments
    const enrollments = await Promise.all(
        allCohorts.map(async (cohort, index) => {
            // Create registration first
            const registration = await prisma.registration.create({
                data: {
                    userId: learnerUser.id,
                    cohortId: cohort.id,
                    status: 'CONFIRMED',
                    confirmedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
                },
            });

            // Create enrollment
            const enrollment = await prisma.enrollment.create({
                data: {
                    userId: learnerUser.id,
                    cohortId: cohort.id,
                    registrationId: registration.id,
                    status: index === 0 ? 'IN_PROGRESS' : 'ENROLLED',
                    progress: index === 0 ? 65 : 15, // First course: 65% progress, Second: 15%
                    completionPercentage: index === 0 ? 65 : 15,
                    certificateEligible: index === 0 ? false : false, // Not yet eligible
                    lastActivityAt: new Date(),
                },
            });

            return enrollment;
        })
    );

    console.log(`   ✅ Created ${enrollments.length} enrollments for learner`);

    // =========================================================================
    // 8. COURSE MATERIALS
    // =========================================================================
    console.log('📄 Creating course materials...');

    const allPrograms = await prisma.program.findMany({
        take: 2,
        orderBy: { createdAt: 'asc' },
    });

    const materials = await Promise.all([
        // Materials for AI Fundamentals
        prisma.courseMaterial.create({
            data: {
                programId: allPrograms[0].id,
                titleAr: 'مقدمة في الذكاء الاصطناعي',
                titleEn: 'Introduction to AI',
                descriptionAr: 'عرض تقديمي شامل عن أساسيات الذكاء الاصطناعي',
                descriptionEn: 'Comprehensive presentation on AI fundamentals',
                type: 'PRESENTATION',
                externalLink: 'https://example.com/ai-intro.pptx',
                fileSize: 2500000, // 2.5MB
            },
        }),
        prisma.courseMaterial.create({
            data: {
                programId: allPrograms[0].id,
                titleAr: 'دليل Python للمبتدئين',
                titleEn: 'Python Guide for Beginners',
                descriptionAr: 'دليل PDF شامل لتعلم لغة Python',
                descriptionEn: 'Comprehensive PDF guide to learn Python',
                type: 'PDF',
                externalLink: 'https://example.com/python-guide.pdf',
                fileSize: 5000000, // 5MB
            },
        }),
        prisma.courseMaterial.create({
            data: {
                programId: allPrograms[0].id,
                titleAr: 'محاضرة مسجلة: تطبيقات الذكاء الاصطناعي',
                titleEn: 'Recorded Lecture: AI Applications',
                descriptionAr: 'محاضرة مسجلة عن تطبيقات الذكاء الاصطناعي في الأعمال',
                descriptionEn: 'Recorded lecture on AI applications in business',
                type: 'VIDEO',
                externalLink: 'https://example.com/ai-applications.mp4',
                fileSize: 150000000, // 150MB
            },
        }),
        // Materials for Digital Marketing
        prisma.courseMaterial.create({
            data: {
                programId: allPrograms[1].id,
                titleAr: 'استراتيجيات التسويق الرقمي',
                titleEn: 'Digital Marketing Strategies',
                descriptionAr: 'ملف شامل عن استراتيجيات التسويق الرقمي الحديثة',
                descriptionEn: 'Comprehensive file on modern digital marketing strategies',
                type: 'DOCUMENT',
                externalLink: 'https://example.com/marketing-strategies.docx',
                fileSize: 1800000, // 1.8MB
            },
        }),
        prisma.courseMaterial.create({
            data: {
                programId: allPrograms[1].id,
                titleAr: 'رابط: أدوات Google Analytics',
                titleEn: 'Link: Google Analytics Tools',
                descriptionAr: 'رابط مباشر لأدوات Google Analytics',
                descriptionEn: 'Direct link to Google Analytics tools',
                type: 'LINK',
                externalLink: 'https://analytics.google.com',
                fileSize: null,
            },
        }),
    ]);

    console.log(`   ✅ Created ${materials.length} course materials`);

    // =========================================================================
    // 9. INSTRUCTOR MESSAGES
    // =========================================================================
    console.log('✉️ Creating instructor messages...');

    const messages = await Promise.all([
        // Messages for first cohort (AI Fundamentals)
        prisma.cohortMessage.create({
            data: {
                cohortId: allCohorts[0].id,
                instructorId: instructors[0].id,
                subject: 'مرحباً بكم في دورة الذكاء الاصطناعي',
                message: 'أهلاً بكم جميعاً في دورة أساسيات الذكاء الاصطناعي!\n\nأنا سعيد بانضمامكم لهذه الرحلة التعليمية المميزة. خلال الأسابيع القادمة سنتعلم معاً أساسيات الذكاء الاصطناعي وتطبيقاته العملية.\n\nيرجى التأكد من:\n- تحميل المواد التدريبية من القسم المخصص\n- الحضور في الوقت المحدد للجلسات\n- التفاعل والمشاركة في النقاشات\n\nأتطلع للقائكم في الجلسة الأولى!\n\nد. أحمد العتيبي',
                sentAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
            },
        }),
        prisma.cohortMessage.create({
            data: {
                cohortId: allCohorts[0].id,
                instructorId: instructors[0].id,
                subject: 'تذكير: الواجب الأول',
                message: 'السلام عليكم طلابي الأعزاء،\n\nأذكركم بموعد تسليم الواجب الأول والذي يتضمن:\n1. قراءة الفصل الثالث من كتاب المقرر\n2. حل التمارين المرفقة\n3. إعداد تقرير بسيط عن تطبيق عملي للذكاء الاصطناعي\n\nالموعد النهائي للتسليم: نهاية الأسبوع الحالي.\n\nبالتوفيق للجميع!',
                sentAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
            },
        }),
        prisma.cohortMessage.create({
            data: {
                cohortId: allCohorts[0].id,
                instructorId: instructors[0].id,
                subject: 'إعلان مهم: تغيير موعد الجلسة القادمة',
                message: 'عزيزي الطالب،\n\nنود إعلامكم بتغيير موعد الجلسة القادمة من الثلاثاء إلى الأربعاء في نفس التوقيت بسبب ظرف طارئ.\n\nالموعد الجديد: الأربعاء 7:00 مساءً\n\nنعتذر عن هذا التغيير المفاجئ ونتمنى لكم التوفيق.',
                sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            },
        }),
        // Messages for second cohort (Digital Marketing)
        prisma.cohortMessage.create({
            data: {
                cohortId: allCohorts[1].id,
                instructorId: instructors[1].id,
                subject: 'مرحباً بكم في دورة التسويق الرقمي',
                message: 'السلام عليكم ورحمة الله وبركاته،\n\nأهلاً وسهلاً بكم في دورة التسويق الرقمي الاحترافي. يسعدني أن أكون مدربتكم في هذه الرحلة نحو إتقان فنون التسويق الرقمي.\n\nما سنتعلمه معاً:\n- إعلانات Google و Facebook\n- تحسين محركات البحث (SEO)\n- التسويق بالمحتوى\n- تحليل البيانات\n\nأنصحكم بإنشاء حسابات تجريبية على المنصات التي سندرسها للتطبيق العملي.\n\nأراكم قريباً!\nد. سارة الشمري',
                sentAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
            },
        }),
    ]);

    console.log(`   ✅ Created ${messages.length} instructor messages`);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('   Admin: admin@seu.edu.sa / Test@123');
    console.log('   Learner: learner@seu.edu.sa / Test@123');
    console.log('   Coordinator: coordinator@seu.edu.sa / Test@123');
    console.log('\n🎟️ Promo Codes: SEU20, WELCOME500, NEWYEAR25');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
