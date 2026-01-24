"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, Users, ArrowLeft, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { Program, AvailabilityStatus } from "@/services/catalog/types";

// Arabic labels for availability status
const availabilityLabels: Record<AvailabilityStatus, { label: string; color: string; bg: string }> = {
  AVAILABLE: { label: 'متاح للتسجيل', color: '#32B7A8', bg: 'rgba(50, 183, 168, 0.1)' },
  UPCOMING: { label: 'يبدأ قريباً', color: '#0083BE', bg: 'rgba(0, 131, 190, 0.1)' },
  COMING_SOON: { label: 'قريباً', color: '#593888', bg: 'rgba(89, 56, 136, 0.1)' },
  SOLD_OUT: { label: 'مكتمل', color: '#FFA300', bg: 'rgba(255, 163, 0, 0.1)' },
};

interface ProgramCardProps {
    program: Program;
    index?: number;
}

export function ProgramCard({ program, index = 0 }: ProgramCardProps) {
    const formatPrice = (price: string | number) => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: program.currency || 'SAR',
            minimumFractionDigits: 0,
        }).format(numPrice);
    };

    const getAvailableSeats = () => {
        if (!program.cohorts || program.cohorts.length === 0) return null;
        
        const openCohorts = program.cohorts.filter(c => c.status === 'OPEN');
        if (openCohorts.length === 0) return null;

        const totalAvailable = openCohorts.reduce(
            (sum, cohort) => sum + (cohort.capacity - cohort.enrolledCount),
            0
        );

        return totalAvailable;
    };

    const getNextStartDate = () => {
        if (!program.cohorts || program.cohorts.length === 0) return null;
        
        const upcomingCohorts = program.cohorts
            .filter(c => c.status === 'OPEN' || c.status === 'UPCOMING')
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

        if (upcomingCohorts.length === 0) return null;

        return new Date(upcomingCohorts[0].startDate).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const availableSeats = getAvailableSeats();
    const nextStartDate = getNextStartDate();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
        >
            <Link href={`/programs/${program.slug}`}>
                <div className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                    {/* Image */}
                    <div className="relative h-48 bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden">
                        {program.imageUrl ? (
                            <Image
                                src={program.imageUrl}
                                alt={program.titleAr}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-6xl opacity-20">📚</div>
                            </div>
                        )}
                        
                        {/* Badges */}
                        <div className="absolute top-4 right-4 flex flex-col gap-2">
                            {program.isFeatured && (
                                <div className="bg-accent text-white px-3 py-1 rounded-full text-sm font-bold">
                                    مميز
                                </div>
                            )}
                            {program.availabilityStatus && (
                                <div
                                    className="px-3 py-1 rounded-full text-sm font-bold"
                                    style={{
                                        background: availabilityLabels[program.availabilityStatus]?.bg,
                                        color: availabilityLabels[program.availabilityStatus]?.color,
                                    }}
                                >
                                    {availabilityLabels[program.availabilityStatus]?.label}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col">
                        {/* Category */}
                        {program.category && (
                            <span className="text-sm font-medium text-accent mb-2">
                                {program.category.nameAr}
                            </span>
                        )}

                        {/* Title */}
                        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                            {program.titleAr}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                            {program.shortDescriptionAr}
                        </p>

                        {/* Meta Info */}
                        <div className="space-y-2 mb-4">
                            {program.durationHours && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span>{program.durationHours} ساعة تدريبية</span>
                                </div>
                            )}

                            {nextStartDate && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span>يبدأ: {nextStartDate}</span>
                                </div>
                            )}

                            {availableSeats !== null && availableSeats > 0 && (
                                <div className="flex items-center gap-2 text-sm text-green-600">
                                    <Users className="w-4 h-4" />
                                    <span>{availableSeats} مقعد متاح</span>
                                </div>
                            )}

                            {availableSeats === 0 && (
                                <div className="flex items-center gap-2 text-sm text-red-600">
                                    <Users className="w-4 h-4" />
                                    <span>المقاعد ممتلئة</span>
                                </div>
                            )}

                            {/* Show "Notify Me" hint for coming soon programs */}
                            {program.availabilityStatus === 'COMING_SOON' && (
                                <div className="flex items-center gap-2 text-sm" style={{ color: '#593888' }}>
                                    <Bell className="w-4 h-4" />
                                    <span>أعلمني عند التوفر</span>
                                </div>
                            )}
                        </div>

                        {/* Instructor */}
                        {program.instructor && (
                            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                    {program.instructor.imageUrl ? (
                                        <Image
                                            src={program.instructor.imageUrl}
                                            alt={program.instructor.nameAr}
                                            width={40}
                                            height={40}
                                            className="object-cover"
                                        />
                                    ) : (
                                        <span className="text-gray-400">👤</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {program.instructor.nameAr}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {program.instructor.titleAr}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-2xl font-bold text-primary">
                                    {formatPrice(program.price)}
                                </span>
                            </div>
                            <Button className="gap-2 group-hover:gap-3 transition-all">
                                عرض التفاصيل
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
