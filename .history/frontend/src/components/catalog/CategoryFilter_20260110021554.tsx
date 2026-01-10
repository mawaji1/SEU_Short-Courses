"use client";

import { useState, useEffect } from "react";
import { Category } from "@/services/catalog/types";
import { catalogService } from "@/services/catalog";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface CategoryFilterProps {
    selectedCategoryId?: string;
    onCategoryChange: (categoryId: string | undefined) => void;
}

export function CategoryFilter({ selectedCategoryId, onCategoryChange }: CategoryFilterProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const data = await catalogService.getCategories();
            setCategories(data);
        } catch (error) {
            console.error('Failed to load categories:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">التصنيفات</h3>
            
            <div className="space-y-2">
                {/* All Categories */}
                <motion.button
                    whileHover={{ x: -4 }}
                    onClick={() => onCategoryChange(undefined)}
                    className={`w-full text-right px-4 py-3 rounded-xl transition-all ${
                        !selectedCategoryId
                            ? 'bg-primary text-white font-bold'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span>جميع البرامج</span>
                        {!selectedCategoryId && (
                            <span className="text-sm">✓</span>
                        )}
                    </div>
                </motion.button>

                {/* Category List */}
                {categories.map((category) => (
                    <motion.button
                        key={category.id}
                        whileHover={{ x: -4 }}
                        onClick={() => onCategoryChange(category.id)}
                        className={`w-full text-right px-4 py-3 rounded-xl transition-all ${
                            selectedCategoryId === category.id
                                ? 'bg-primary text-white font-bold'
                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <div className="font-medium">{category.nameAr}</div>
                                {category._count && (
                                    <div className="text-sm opacity-75 mt-1">
                                        {category._count.programs} برنامج
                                    </div>
                                )}
                            </div>
                            {selectedCategoryId === category.id && (
                                <span className="text-sm">✓</span>
                            )}
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
