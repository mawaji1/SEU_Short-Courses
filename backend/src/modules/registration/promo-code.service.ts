import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { PromoCodeType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { CreatePromoCodeDto } from './dto';

export interface ValidatePromoCodeResult {
  isValid: boolean;
  promoCode?: {
    id: string;
    code: string;
    type: PromoCodeType;
    value: number;
    maxDiscount: number | null;
  };
  discountAmount: number;
  finalPrice: number;
  error?: string;
}

/**
 * Promo Code Service
 *
 * Handles promo code validation and application:
 * - Validate promo code eligibility
 * - Calculate discount amount
 * - Track usage
 * - Admin CRUD operations
 */
@Injectable()
export class PromoCodeService {
  constructor(private prisma: PrismaService) {}

  /**
   * Validate a promo code for a specific purchase
   */
  async validatePromoCode(
    code: string,
    originalPrice: number,
    programId?: string,
  ): Promise<ValidatePromoCodeResult> {
    const promoCode = await this.prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promoCode) {
      return {
        isValid: false,
        discountAmount: 0,
        finalPrice: originalPrice,
        error: 'كود الخصم غير صالح',
      };
    }

    // Check if active
    if (!promoCode.isActive) {
      return {
        isValid: false,
        discountAmount: 0,
        finalPrice: originalPrice,
        error: 'كود الخصم غير مفعل',
      };
    }

    // Check validity dates
    const now = new Date();
    if (now < promoCode.validFrom) {
      return {
        isValid: false,
        discountAmount: 0,
        finalPrice: originalPrice,
        error: 'كود الخصم لم يبدأ بعد',
      };
    }
    if (promoCode.validUntil && now > promoCode.validUntil) {
      return {
        isValid: false,
        discountAmount: 0,
        finalPrice: originalPrice,
        error: 'كود الخصم منتهي الصلاحية',
      };
    }

    // Check usage limit
    if (promoCode.maxUses && promoCode.usedCount >= promoCode.maxUses) {
      return {
        isValid: false,
        discountAmount: 0,
        finalPrice: originalPrice,
        error: 'كود الخصم وصل للحد الأقصى من الاستخدام',
      };
    }

    // Check program restriction
    if (promoCode.programId && programId && promoCode.programId !== programId) {
      return {
        isValid: false,
        discountAmount: 0,
        finalPrice: originalPrice,
        error: 'كود الخصم لا ينطبق على هذا البرنامج',
      };
    }

    // Check minimum purchase
    if (
      promoCode.minPurchase &&
      originalPrice < Number(promoCode.minPurchase)
    ) {
      return {
        isValid: false,
        discountAmount: 0,
        finalPrice: originalPrice,
        error: `الحد الأدنى للشراء ${promoCode.minPurchase} ر.س`,
      };
    }

    // Calculate discount
    let discountAmount: number;
    if (promoCode.type === PromoCodeType.PERCENTAGE) {
      discountAmount = (originalPrice * Number(promoCode.value)) / 100;
      // Apply max discount cap if exists
      if (
        promoCode.maxDiscount &&
        discountAmount > Number(promoCode.maxDiscount)
      ) {
        discountAmount = Number(promoCode.maxDiscount);
      }
    } else {
      // Fixed amount
      discountAmount = Number(promoCode.value);
    }

    // Ensure discount doesn't exceed original price
    discountAmount = Math.min(discountAmount, originalPrice);
    const finalPrice = originalPrice - discountAmount;

    return {
      isValid: true,
      promoCode: {
        id: promoCode.id,
        code: promoCode.code,
        type: promoCode.type,
        value: Number(promoCode.value),
        maxDiscount: promoCode.maxDiscount
          ? Number(promoCode.maxDiscount)
          : null,
      },
      discountAmount,
      finalPrice,
    };
  }

  /**
   * Record promo code usage after successful registration
   */
  async recordUsage(
    promoCodeId: string,
    registrationId: string,
    discountAmount: number,
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.promoCodeUsage.create({
        data: {
          promoCodeId,
          registrationId,
          discountAmount: new Decimal(discountAmount),
        },
      }),
      this.prisma.promoCode.update({
        where: { id: promoCodeId },
        data: { usedCount: { increment: 1 } },
      }),
    ]);
  }

  /**
   * Create a new promo code (admin)
   */
  async createPromoCode(dto: CreatePromoCodeDto) {
    return this.prisma.promoCode.create({
      data: {
        code: dto.code.toUpperCase(),
        type: dto.type,
        value: new Decimal(dto.value),
        maxUses: dto.maxUses,
        minPurchase: dto.minPurchase ? new Decimal(dto.minPurchase) : null,
        maxDiscount: dto.maxDiscount ? new Decimal(dto.maxDiscount) : null,
        programId: dto.programId,
        validFrom: dto.validFrom || new Date(),
        validUntil: dto.validUntil,
      },
    });
  }

  /**
   * Get all promo codes (admin)
   */
  async findAllPromoCodes(includeInactive = false) {
    return this.prisma.promoCode.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Deactivate a promo code (admin)
   */
  async deactivatePromoCode(id: string) {
    return this.prisma.promoCode.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
