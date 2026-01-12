import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Reset Admin Password
 * 
 * Resets admin password to default
 */
async function resetAdminPassword() {
  console.log('🔑 Resetting admin password...');

  const adminEmail = 'admin@seu.edu.sa';
  const newPassword = 'Admin@123456';

  // Check if admin exists
  const admin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!admin) {
    console.log('❌ Admin user not found:', adminEmail);
    return;
  }

  // Hash new password
  const passwordHash = await bcrypt.hash(newPassword, 10);

  // Update password
  await prisma.user.update({
    where: { email: adminEmail },
    data: { passwordHash },
  });

  console.log('✅ Admin password reset successfully!');
  console.log('   Email:', adminEmail);
  console.log('   New Password:', newPassword);
}

resetAdminPassword()
  .catch((error) => {
    console.error('❌ Error resetting password:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
