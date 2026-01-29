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
                descriptionAr: 'دورة متخصصة في حماية البنية التحتية الرقمية للمؤسسات. تغطي أحدث التقنيات والممارسات في مجال الأمن السيبراني.',
                descriptionEn: 'Specialized course in protecting enterprise digital infrastructure. Covers latest cybersecurity technologies and best practices.',
                shortDescriptionAr: 'احمِ مؤسستك من التهديدات السيبرانية',
                shortDescriptionEn: 'Protect your organization from cyber threats',
                slug: 'cybersecurity',
                type: ProgramType.CERTIFICATION,
                deliveryMode: DeliveryMode.ONLINE,
                durationHours: 30,
                price: new Decimal(2800),
                status: ProgramStatus.PUBLISHED,
                categoryId: techCategory.id,
                isFeatured: true,
                certificateEnabled: true,
                certificateAttendanceThreshold: 75,
                learningOutcomesAr: [
                    'فهم أساسيات الأمن السيبراني',
                    'تحديد وتحليل التهديدات الأمنية',
                    'تطبيق أفضل ممارسات الحماية',
                    'إدارة الحوادث الأمنية',
                ],
                learningOutcomesEn: [
                    'Understand cybersecurity fundamentals',
                    'Identify and analyze security threats',
                    'Apply security best practices',
                    'Manage security incidents',
                ],
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
                instructorId: instructors[0].id, // د. أحمد العتيبي
                nameAr: 'الموعد الأول - يناير 2026',
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
                instructorId: instructors[0].id, // د. أحمد العتيبي
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
                instructorId: instructors[0].id, // د. أحمد العتيبي
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
                instructorId: instructors[1].id, // د. سارة الشمري
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
                instructorId: instructors[2].id, // د. محمد القحطاني
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
        // Cybersecurity - Completed cohort (for certificate testing)
        prisma.cohort.create({
            data: {
                programId: programs[3].id,
                instructorId: instructors[3].id, // د. نورة العنزي
                nameAr: 'الموعد الأول - ديسمبر 2025',
                nameEn: 'Cohort 1 - December 2025',
                startDate: new Date('2025-11-01'),
                endDate: new Date('2025-12-15'),
                registrationStartDate: new Date('2025-10-01'),
                registrationEndDate: new Date('2025-10-25'),
                capacity: 25,
                enrolledCount: 22,
                status: CohortStatus.COMPLETED,
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
    // 6. TEST USERS (Better Auth compatible)
    // =========================================================================
    console.log('👤 Creating test users...');

    // Better Auth stores passwords in the Account table, not User table
    const passwordHash = await bcrypt.hash('Test@123', 10);

    // Helper function to create user with Better Auth Account
    async function createBetterAuthUser(data: {
        email: string;
        firstName: string;
        lastName: string;
        role: UserRole;
    }) {
        const userId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const accountId = `acc_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
        if (existingUser) {
            return existingUser;
        }

        // Create user
        const user = await prisma.user.create({
            data: {
                id: userId,
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                name: `${data.firstName} ${data.lastName}`,
                role: data.role,
                emailVerified: true,
                isActive: true,
            },
        });

        // Create Better Auth Account with password
        await prisma.account.create({
            data: {
                id: accountId,
                userId: user.id,
                accountId: user.id, // For credential provider, accountId = userId
                providerId: 'credential',
                password: passwordHash,
            },
        });

        return user;
    }

    const users = await Promise.all([
        createBetterAuthUser({
            email: 'admin@seu.edu.sa',
            firstName: 'مدير',
            lastName: 'النظام',
            role: UserRole.ADMIN,
        }),
        createBetterAuthUser({
            email: 'learner@seu.edu.sa',
            firstName: 'محمد',
            lastName: 'المتدرب',
            role: UserRole.LEARNER,
        }),
        createBetterAuthUser({
            email: 'coordinator@seu.edu.sa',
            firstName: 'أحمد',
            lastName: 'المنسق',
            role: UserRole.CORPORATE_COORDINATOR,
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

    // Get specific cohorts by program for enrollments (reliable method)
    const aiCohort = await prisma.cohort.findFirst({
        where: { program: { slug: 'ai-fundamentals' } },
        include: { program: true },
    });
    const marketingCohort = await prisma.cohort.findFirst({
        where: { program: { slug: 'digital-marketing' } },
        include: { program: true },
    });
    const completedCohort = await prisma.cohort.findFirst({
        where: { program: { slug: 'cybersecurity' }, status: 'COMPLETED' },
        include: { program: true },
    });

    if (!aiCohort || !marketingCohort) {
        throw new Error('Required cohorts not found');
    }

    // Create enrollments for the learner
    const enrollments: any[] = [];

    // 1. AI Fundamentals - In Progress (65%)
    const aiRegistration = await prisma.registration.create({
        data: {
            userId: learnerUser.id,
            cohortId: aiCohort.id,
            status: 'CONFIRMED',
            confirmedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
    });
    const aiEnrollment = await prisma.enrollment.create({
        data: {
            userId: learnerUser.id,
            cohortId: aiCohort.id,
            registrationId: aiRegistration.id,
            status: 'IN_PROGRESS',
            completionStatus: 'IN_PROGRESS',
            progress: 65,
            completionPercentage: 65,
            certificateEligible: false,
            lastActivityAt: new Date(),
        },
    });
    enrollments.push(aiEnrollment);

    // 2. Digital Marketing - Just Enrolled (15%)
    const marketingRegistration = await prisma.registration.create({
        data: {
            userId: learnerUser.id,
            cohortId: marketingCohort.id,
            status: 'CONFIRMED',
            confirmedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        },
    });
    const marketingEnrollment = await prisma.enrollment.create({
        data: {
            userId: learnerUser.id,
            cohortId: marketingCohort.id,
            registrationId: marketingRegistration.id,
            status: 'ENROLLED',
            completionStatus: 'NOT_STARTED',
            progress: 0,
            completionPercentage: 0,
            certificateEligible: false,
            lastActivityAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
    });
    enrollments.push(marketingEnrollment);

    // 3. Cybersecurity - Completed (100%) with Certificate
    if (completedCohort) {
        const cyberRegistration = await prisma.registration.create({
            data: {
                userId: learnerUser.id,
                cohortId: completedCohort.id,
                status: 'CONFIRMED',
                confirmedAt: new Date('2025-10-20T10:00:00.000Z'),
            },
        });
        const cyberEnrollment = await prisma.enrollment.create({
            data: {
                userId: learnerUser.id,
                cohortId: completedCohort.id,
                registrationId: cyberRegistration.id,
                status: 'COMPLETED',
                completionStatus: 'COMPLETED',
                progress: 100,
                completionPercentage: 100,
                certificateEligible: true,
                completedAt: new Date('2025-12-15T14:00:00.000Z'),
                lastActivityAt: new Date('2025-12-15T14:00:00.000Z'),
            },
        });
        enrollments.push(cyberEnrollment);

        // Create Certificate for completed course - SEU (الجامعة السعودية الإلكترونية)
        console.log('🏆 Creating certificate for SEU Short Courses...');
        const certificate = await prisma.certificate.create({
            data: {
                enrollmentId: cyberEnrollment.id,
                userId: learnerUser.id,
                cohortId: completedCohort.id,
                number: `SEU-SC-${completedCohort.program.slug.toUpperCase()}-2025-0001`,
                issuedAt: new Date('2025-12-16T10:00:00.000Z'),
                status: 'ISSUED',
                verificationCode: `SEUSC2025${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
                pdfUrl: null, // PDF will be generated on demand
            },
        });
        console.log(`   ✅ Created certificate: ${certificate.number}`);
    }

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
    // 9. CURRICULUM MODULES & SESSIONS
    // =========================================================================
    console.log('📖 Creating curriculum modules and sessions...');

    // Curriculum for AI Fundamentals
    const aiModules = await Promise.all([
        prisma.programModule.create({
            data: {
                programId: allPrograms[0].id,
                titleAr: 'مقدمة في الذكاء الاصطناعي',
                titleEn: 'Introduction to AI',
                descriptionAr: 'التعرف على أساسيات الذكاء الاصطناعي وتاريخه وتطبيقاته',
                sortOrder: 1,
                sessions: {
                    create: [
                        {
                            titleAr: 'ما هو الذكاء الاصطناعي؟',
                            titleEn: 'What is Artificial Intelligence?',
                            descriptionAr: 'مقدمة شاملة عن مفهوم الذكاء الاصطناعي',
                            sortOrder: 1,
                        },
                        {
                            titleAr: 'تاريخ وتطور الذكاء الاصطناعي',
                            titleEn: 'History and Evolution of AI',
                            descriptionAr: 'نظرة على تطور الذكاء الاصطناعي عبر العقود',
                            sortOrder: 2,
                        },
                        {
                            titleAr: 'أنواع الذكاء الاصطناعي',
                            titleEn: 'Types of Artificial Intelligence',
                            descriptionAr: 'الفرق بين الذكاء الاصطناعي الضيق والعام',
                            sortOrder: 3,
                        },
                    ],
                },
            },
        }),
        prisma.programModule.create({
            data: {
                programId: allPrograms[0].id,
                titleAr: 'تعلم الآلة',
                titleEn: 'Machine Learning',
                descriptionAr: 'أساسيات تعلم الآلة وأنواعه المختلفة',
                sortOrder: 2,
                sessions: {
                    create: [
                        {
                            titleAr: 'مفاهيم تعلم الآلة الأساسية',
                            titleEn: 'Basic Machine Learning Concepts',
                            descriptionAr: 'التعرف على المفاهيم الأساسية في تعلم الآلة',
                            sortOrder: 1,
                        },
                        {
                            titleAr: 'التعلم تحت الإشراف',
                            titleEn: 'Supervised Learning',
                            descriptionAr: 'فهم التعلم تحت الإشراف وتطبيقاته',
                            sortOrder: 2,
                        },
                        {
                            titleAr: 'التعلم بدون إشراف',
                            titleEn: 'Unsupervised Learning',
                            descriptionAr: 'فهم التعلم بدون إشراف وتقنياته',
                            sortOrder: 3,
                        },
                        {
                            titleAr: 'التعلم المعزز',
                            titleEn: 'Reinforcement Learning',
                            descriptionAr: 'مقدمة في التعلم المعزز',
                            sortOrder: 4,
                        },
                    ],
                },
            },
        }),
        prisma.programModule.create({
            data: {
                programId: allPrograms[0].id,
                titleAr: 'البرمجة بلغة Python للذكاء الاصطناعي',
                titleEn: 'Python Programming for AI',
                descriptionAr: 'تعلم أساسيات Python وأهم المكتبات المستخدمة في الذكاء الاصطناعي',
                sortOrder: 3,
                sessions: {
                    create: [
                        {
                            titleAr: 'أساسيات Python',
                            titleEn: 'Python Basics',
                            descriptionAr: 'التعرف على لغة Python وبيئة العمل',
                            sortOrder: 1,
                        },
                        {
                            titleAr: 'مكتبة NumPy',
                            titleEn: 'NumPy Library',
                            descriptionAr: 'العمل مع المصفوفات والحسابات الرقمية',
                            sortOrder: 2,
                        },
                        {
                            titleAr: 'مكتبة Pandas',
                            titleEn: 'Pandas Library',
                            descriptionAr: 'تحليل ومعالجة البيانات',
                            sortOrder: 3,
                        },
                        {
                            titleAr: 'مكتبة Scikit-learn',
                            titleEn: 'Scikit-learn Library',
                            descriptionAr: 'بناء نماذج تعلم الآلة',
                            sortOrder: 4,
                        },
                    ],
                },
            },
        }),
        prisma.programModule.create({
            data: {
                programId: allPrograms[0].id,
                titleAr: 'مشروع التخرج',
                titleEn: 'Final Project',
                descriptionAr: 'تطبيق عملي شامل لما تم تعلمه خلال الدورة',
                sortOrder: 4,
                sessions: {
                    create: [
                        {
                            titleAr: 'تحديد فكرة المشروع',
                            titleEn: 'Project Idea Definition',
                            descriptionAr: 'اختيار مشكلة حقيقية وتحديد الحل',
                            sortOrder: 1,
                        },
                        {
                            titleAr: 'جمع وتحضير البيانات',
                            titleEn: 'Data Collection and Preparation',
                            descriptionAr: 'جمع البيانات المطلوبة وتنظيفها',
                            sortOrder: 2,
                        },
                        {
                            titleAr: 'بناء النموذج وتقييمه',
                            titleEn: 'Model Building and Evaluation',
                            descriptionAr: 'تطوير النموذج واختباره',
                            sortOrder: 3,
                        },
                        {
                            titleAr: 'العرض النهائي',
                            titleEn: 'Final Presentation',
                            descriptionAr: 'تقديم المشروع ومناقشته',
                            sortOrder: 4,
                        },
                    ],
                },
            },
        }),
    ]);

    // Curriculum for Digital Marketing
    const marketingModules = await Promise.all([
        prisma.programModule.create({
            data: {
                programId: allPrograms[1].id,
                titleAr: 'أساسيات التسويق الرقمي',
                titleEn: 'Digital Marketing Fundamentals',
                descriptionAr: 'مقدمة شاملة في عالم التسويق الرقمي',
                sortOrder: 1,
                sessions: {
                    create: [
                        {
                            titleAr: 'مفاهيم التسويق الرقمي',
                            titleEn: 'Digital Marketing Concepts',
                            sortOrder: 1,
                        },
                        {
                            titleAr: 'قنوات التسويق الرقمي',
                            titleEn: 'Digital Marketing Channels',
                            sortOrder: 2,
                        },
                        {
                            titleAr: 'بناء الاستراتيجية الرقمية',
                            titleEn: 'Building Digital Strategy',
                            sortOrder: 3,
                        },
                    ],
                },
            },
        }),
        prisma.programModule.create({
            data: {
                programId: allPrograms[1].id,
                titleAr: 'إعلانات Google',
                titleEn: 'Google Ads',
                descriptionAr: 'إتقان إعلانات Google للوصول للعملاء المستهدفين',
                sortOrder: 2,
                sessions: {
                    create: [
                        {
                            titleAr: 'إنشاء حساب Google Ads',
                            titleEn: 'Creating Google Ads Account',
                            sortOrder: 1,
                        },
                        {
                            titleAr: 'حملات البحث',
                            titleEn: 'Search Campaigns',
                            sortOrder: 2,
                        },
                        {
                            titleAr: 'حملات العرض',
                            titleEn: 'Display Campaigns',
                            sortOrder: 3,
                        },
                    ],
                },
            },
        }),
        prisma.programModule.create({
            data: {
                programId: allPrograms[1].id,
                titleAr: 'التسويق عبر وسائل التواصل',
                titleEn: 'Social Media Marketing',
                descriptionAr: 'استراتيجيات التسويق على منصات التواصل الاجتماعي',
                sortOrder: 3,
                sessions: {
                    create: [
                        {
                            titleAr: 'التسويق على Instagram',
                            titleEn: 'Instagram Marketing',
                            sortOrder: 1,
                        },
                        {
                            titleAr: 'التسويق على Twitter/X',
                            titleEn: 'Twitter/X Marketing',
                            sortOrder: 2,
                        },
                        {
                            titleAr: 'التسويق على LinkedIn',
                            titleEn: 'LinkedIn Marketing',
                            sortOrder: 3,
                        },
                    ],
                },
            },
        }),
    ]);

    // Curriculum for Cybersecurity (completed course)
    const cyberModules = await Promise.all([
        prisma.programModule.create({
            data: {
                programId: programs[3].id,
                titleAr: 'أساسيات الأمن السيبراني',
                titleEn: 'Cybersecurity Fundamentals',
                descriptionAr: 'مقدمة شاملة في أمن المعلومات والتهديدات السيبرانية',
                sortOrder: 1,
                sessions: {
                    create: [
                        {
                            titleAr: 'مفاهيم الأمن السيبراني',
                            titleEn: 'Cybersecurity Concepts',
                            sortOrder: 1,
                        },
                        {
                            titleAr: 'أنواع التهديدات الأمنية',
                            titleEn: 'Types of Security Threats',
                            sortOrder: 2,
                        },
                        {
                            titleAr: 'مبادئ الحماية الأساسية',
                            titleEn: 'Basic Protection Principles',
                            sortOrder: 3,
                        },
                    ],
                },
            },
        }),
        prisma.programModule.create({
            data: {
                programId: programs[3].id,
                titleAr: 'أمن الشبكات',
                titleEn: 'Network Security',
                descriptionAr: 'حماية الشبكات من الاختراقات والهجمات',
                sortOrder: 2,
                sessions: {
                    create: [
                        {
                            titleAr: 'جدران الحماية',
                            titleEn: 'Firewalls',
                            sortOrder: 1,
                        },
                        {
                            titleAr: 'أنظمة كشف التسلل',
                            titleEn: 'Intrusion Detection Systems',
                            sortOrder: 2,
                        },
                        {
                            titleAr: 'تأمين الشبكات اللاسلكية',
                            titleEn: 'Wireless Network Security',
                            sortOrder: 3,
                        },
                    ],
                },
            },
        }),
        prisma.programModule.create({
            data: {
                programId: programs[3].id,
                titleAr: 'الاستجابة للحوادث',
                titleEn: 'Incident Response',
                descriptionAr: 'كيفية التعامل مع الحوادث الأمنية',
                sortOrder: 3,
                sessions: {
                    create: [
                        {
                            titleAr: 'خطة الاستجابة للحوادث',
                            titleEn: 'Incident Response Plan',
                            sortOrder: 1,
                        },
                        {
                            titleAr: 'التحقيق الجنائي الرقمي',
                            titleEn: 'Digital Forensics',
                            sortOrder: 2,
                        },
                        {
                            titleAr: 'التعافي من الكوارث',
                            titleEn: 'Disaster Recovery',
                            sortOrder: 3,
                        },
                    ],
                },
            },
        }),
    ]);

    console.log(`   ✅ Created ${aiModules.length + marketingModules.length + cyberModules.length} curriculum modules with sessions`);

    // =========================================================================
    // 10. INSTRUCTOR MESSAGES
    // =========================================================================
    console.log('✉️ Creating instructor messages...');

    const messages = await Promise.all([
        // Messages for AI Fundamentals cohort
        prisma.cohortMessage.create({
            data: {
                cohortId: aiCohort.id,
                instructorId: instructors[0].id,
                subject: 'مرحباً بكم في دورة الذكاء الاصطناعي',
                message: 'أهلاً بكم جميعاً في دورة أساسيات الذكاء الاصطناعي!\n\nأنا سعيد بانضمامكم لهذه الرحلة التعليمية المميزة. خلال الأسابيع القادمة سنتعلم معاً أساسيات الذكاء الاصطناعي وتطبيقاته العملية.\n\nيرجى التأكد من:\n- تحميل المواد التدريبية من القسم المخصص\n- الحضور في الوقت المحدد للجلسات\n- التفاعل والمشاركة في النقاشات\n\nأتطلع للقائكم في الجلسة الأولى!\n\nد. أحمد العتيبي',
                sentAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
            },
        }),
        prisma.cohortMessage.create({
            data: {
                cohortId: aiCohort.id,
                instructorId: instructors[0].id,
                subject: 'تذكير: الواجب الأول',
                message: 'السلام عليكم طلابي الأعزاء،\n\nأذكركم بموعد تسليم الواجب الأول والذي يتضمن:\n1. قراءة الفصل الثالث من كتاب المقرر\n2. حل التمارين المرفقة\n3. إعداد تقرير بسيط عن تطبيق عملي للذكاء الاصطناعي\n\nالموعد النهائي للتسليم: نهاية الأسبوع الحالي.\n\nبالتوفيق للجميع!',
                sentAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
            },
        }),
        prisma.cohortMessage.create({
            data: {
                cohortId: aiCohort.id,
                instructorId: instructors[0].id,
                subject: 'إعلان مهم: تغيير موعد الجلسة القادمة',
                message: 'عزيزي الطالب،\n\nنود إعلامكم بتغيير موعد الجلسة القادمة من الثلاثاء إلى الأربعاء في نفس التوقيت بسبب ظرف طارئ.\n\nالموعد الجديد: الأربعاء 7:00 مساءً\n\nنعتذر عن هذا التغيير المفاجئ ونتمنى لكم التوفيق.',
                sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            },
        }),
        // Messages for Digital Marketing cohort
        prisma.cohortMessage.create({
            data: {
                cohortId: marketingCohort.id,
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
