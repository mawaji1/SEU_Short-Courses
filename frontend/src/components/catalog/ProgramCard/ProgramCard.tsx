import styles from './ProgramCard.module.css';
import { Program } from '@/services/catalog';

interface ProgramCardProps {
    program: Program;
    locale?: 'ar' | 'en';
}

/**
 * Program Card Component
 * 
 * Displays a program summary in a card format.
 * Used in catalog listing and featured sections.
 */
export function ProgramCard({ program, locale = 'ar' }: ProgramCardProps) {
    const title = locale === 'ar' ? program.titleAr : program.titleEn;
    const shortDescription = locale === 'ar' ? program.shortDescriptionAr : program.shortDescriptionEn;
    const categoryName = program.category
        ? (locale === 'ar' ? program.category.nameAr : program.category.nameEn)
        : '';
    const instructorName = program.instructor
        ? (locale === 'ar' ? program.instructor.nameAr : program.instructor.nameEn)
        : '';

    // Format price
    const formattedPrice = new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-SA', {
        style: 'currency',
        currency: 'SAR',
        minimumFractionDigits: 0,
    }).format(Number(program.price));

    // Program type labels
    const typeLabels: Record<string, { ar: string; en: string }> = {
        COURSE: { ar: 'دورة', en: 'Course' },
        WORKSHOP: { ar: 'ورشة عمل', en: 'Workshop' },
        BOOTCAMP: { ar: 'معسكر', en: 'Bootcamp' },
        CERTIFICATION: { ar: 'شهادة', en: 'Certification' },
    };

    // Delivery mode labels
    const deliveryLabels: Record<string, { ar: string; en: string }> = {
        ONLINE: { ar: 'عن بعد', en: 'Online' },
        IN_PERSON: { ar: 'حضوري', en: 'In-Person' },
        HYBRID: { ar: 'مختلط', en: 'Hybrid' },
    };

    const typeLabel = typeLabels[program.type]?.[locale] || program.type;
    const deliveryLabel = deliveryLabels[program.deliveryMode]?.[locale] || program.deliveryMode;

    return (
        <article className={styles.card}>
            {/* Image placeholder */}
            <div className={styles.imageContainer}>
                {program.imageUrl ? (
                    <img src={program.imageUrl} alt={title} className={styles.image} />
                ) : (
                    <div className={styles.imagePlaceholder}>
                        <span className={styles.placeholderIcon}>📚</span>
                    </div>
                )}
                {program.isFeatured && (
                    <span className={styles.featuredBadge}>
                        {locale === 'ar' ? 'مميز' : 'Featured'}
                    </span>
                )}
            </div>

            {/* Content */}
            <div className={styles.content}>
                {/* Category */}
                {categoryName && (
                    <span className={styles.category}>{categoryName}</span>
                )}

                {/* Title */}
                <h3 className={styles.title}>
                    <a href={`/programs/${program.slug}`}>{title}</a>
                </h3>

                {/* Description */}
                <p className={styles.description}>{shortDescription}</p>

                {/* Meta */}
                <div className={styles.meta}>
                    <span className={styles.metaItem}>
                        <span className={styles.metaIcon}>⏱</span>
                        {program.durationHours} {locale === 'ar' ? 'ساعة' : 'hrs'}
                    </span>
                    <span className={styles.metaItem}>
                        <span className={styles.metaIcon}>📍</span>
                        {deliveryLabel}
                    </span>
                    <span className={styles.badge}>{typeLabel}</span>
                </div>

                {/* Instructor */}
                {instructorName && (
                    <div className={styles.instructor}>
                        <span className={styles.instructorIcon}>👤</span>
                        {instructorName}
                    </div>
                )}

                {/* Footer */}
                <div className={styles.footer}>
                    <span className={styles.price}>{formattedPrice}</span>
                    <a href={`/programs/${program.slug}`} className={styles.ctaButton}>
                        {locale === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                    </a>
                </div>
            </div>
        </article>
    );
}

export default ProgramCard;
