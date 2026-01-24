"use client";

import React, { useMemo } from 'react';

interface PasswordStrengthIndicatorProps {
    password: string;
    className?: string;
}

interface StrengthResult {
    score: number;
    label: string;
    labelAr: string;
    color: string;
    bgColor: string;
}

/**
 * Password Strength Indicator Component
 * 
 * Evaluates password strength based on:
 * - Length (8+ characters)
 * - Lowercase letters
 * - Uppercase letters
 * - Numbers
 * - Special characters
 */
export function PasswordStrengthIndicator({ password, className = '' }: PasswordStrengthIndicatorProps) {
    const strength = useMemo<StrengthResult>(() => {
        if (!password) {
            return {
                score: 0,
                label: 'Enter password',
                labelAr: 'أدخل كلمة المرور',
                color: 'bg-gray-300',
                bgColor: 'bg-gray-100',
            };
        }

        let score = 0;
        const checks = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        };

        // Calculate score
        if (checks.length) score++;
        if (checks.lowercase) score++;
        if (checks.uppercase) score++;
        if (checks.number) score++;
        if (checks.special) score++;

        // Bonus for longer passwords
        if (password.length >= 12) score++;
        if (password.length >= 16) score++;

        // Normalize to 0-4 scale
        const normalizedScore = Math.min(Math.floor(score * 4 / 7), 4);

        const strengthLevels: StrengthResult[] = [
            {
                score: 0,
                label: 'Very Weak',
                labelAr: 'ضعيفة جداً',
                color: 'bg-red-500',
                bgColor: 'bg-red-100',
            },
            {
                score: 1,
                label: 'Weak',
                labelAr: 'ضعيفة',
                color: 'bg-orange-500',
                bgColor: 'bg-orange-100',
            },
            {
                score: 2,
                label: 'Fair',
                labelAr: 'متوسطة',
                color: 'bg-yellow-500',
                bgColor: 'bg-yellow-100',
            },
            {
                score: 3,
                label: 'Strong',
                labelAr: 'قوية',
                color: 'bg-lime-500',
                bgColor: 'bg-lime-100',
            },
            {
                score: 4,
                label: 'Very Strong',
                labelAr: 'قوية جداً',
                color: 'bg-green-500',
                bgColor: 'bg-green-100',
            },
        ];

        return strengthLevels[normalizedScore];
    }, [password]);

    // Don't show indicator when password is empty
    if (!password) return null;

    return (
        <div className={`space-y-2 ${className}`}>
            {/* Strength bar */}
            <div className="flex gap-1">
                {[0, 1, 2, 3].map((index) => (
                    <div
                        key={index}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${index < strength.score + 1 ? strength.color : 'bg-gray-200'
                            }`}
                    />
                ))}
            </div>

            {/* Strength label */}
            <div className="flex justify-between items-center text-xs">
                <span className={`font-medium ${strength.color.replace('bg-', 'text-')}`}>
                    {strength.labelAr}
                </span>
                <span className="text-gray-400">
                    {strength.label}
                </span>
            </div>

            {/* Requirements checklist (shown for weak passwords) */}
            {strength.score < 3 && password.length > 0 && (
                <div className="text-xs text-gray-500 space-y-1 mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-700 mb-2">متطلبات كلمة المرور:</p>
                    <ul className="space-y-1">
                        <li className={password.length >= 8 ? 'text-green-600' : 'text-gray-400'}>
                            {password.length >= 8 ? '✓' : '○'} 8 أحرف على الأقل
                        </li>
                        <li className={/[a-z]/.test(password) ? 'text-green-600' : 'text-gray-400'}>
                            {/[a-z]/.test(password) ? '✓' : '○'} حرف صغير (a-z)
                        </li>
                        <li className={/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-400'}>
                            {/[A-Z]/.test(password) ? '✓' : '○'} حرف كبير (A-Z)
                        </li>
                        <li className={/\d/.test(password) ? 'text-green-600' : 'text-gray-400'}>
                            {/\d/.test(password) ? '✓' : '○'} رقم (0-9)
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
}

export default PasswordStrengthIndicator;
