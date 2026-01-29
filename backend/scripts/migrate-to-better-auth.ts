/**
 * Better Auth Migration Script
 *
 * Migrates existing users to Better Auth's account-based system:
 * 1. Creates Account records for users with email/password auth
 * 2. Copies passwordHash to Account.password
 * 3. Populates User.name from firstName + lastName
 *
 * This script is idempotent - safe to run multiple times.
 *
 * Usage:
 *   npx ts-node scripts/migrate-to-better-auth.ts
 */

import { PrismaClient } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Better Auth migration...\n');

  // Get all users
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      passwordHash: true,
      firstName: true,
      lastName: true,
      name: true,
    },
  });

  console.log(`Found ${users.length} users to process\n`);

  let migratedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const user of users) {
    try {
      // Check if user already has an Account record
      const existingAccount = await prisma.account.findFirst({
        where: {
          userId: user.id,
          providerId: 'credential',
        },
      });

      if (existingAccount) {
        console.log(`⏭️  Skipping ${user.email} - Account already exists`);
        skippedCount++;
        continue;
      }

      // Create Account record for email/password auth
      await prisma.$transaction(async (tx) => {
        // Create Account with password
        await tx.account.create({
          data: {
            id: createId(),
            userId: user.id,
            accountId: user.email, // Use email as accountId for credential provider
            providerId: 'credential',
            password: user.passwordHash, // Copy existing hash - bcrypt is compatible
          },
        });

        // Update User.name if not already set
        if (!user.name) {
          await tx.user.update({
            where: { id: user.id },
            data: {
              name: `${user.firstName} ${user.lastName}`.trim(),
            },
          });
        }
      });

      console.log(`✅ Migrated ${user.email}`);
      migratedCount++;
    } catch (error) {
      console.error(`❌ Error migrating ${user.email}:`, error);
      errorCount++;
    }
  }

  console.log('\n========================================');
  console.log('📊 Migration Summary');
  console.log('========================================');
  console.log(`✅ Migrated: ${migratedCount}`);
  console.log(`⏭️  Skipped:  ${skippedCount}`);
  console.log(`❌ Errors:   ${errorCount}`);
  console.log(`📦 Total:    ${users.length}`);
  console.log('========================================\n');

  if (errorCount > 0) {
    console.log('⚠️  Some users failed to migrate. Please check the errors above.');
    process.exit(1);
  }

  console.log('🎉 Migration completed successfully!');
}

main()
  .catch((error) => {
    console.error('Fatal error during migration:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
