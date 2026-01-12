import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Seed Admin User
 * 
 * Creates initial admin account for first-time setup
 * Run with: npx ts-node prisma/seed-admin.ts
 */
async function seedAdmin() {
  console.log('🌱 Seeding admin user...');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@seu.edu.sa';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('⚠️  Admin user already exists:', adminEmail);
    console.log('   Role:', existingAdmin.role);
    return;
  }

  // Hash password
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash,
      firstName: 'مدير',
      lastName: 'النظام',
      role: UserRole.ADMIN,
      isActive: true,
      emailVerified: true,
    },
  });

  console.log('✅ Admin user created successfully!');
  console.log('   Email:', admin.email);
  console.log('   Password:', adminPassword);
  console.log('   Role:', admin.role);
  console.log('');
  console.log('⚠️  IMPORTANT: Change the password after first login!');
}

seedAdmin()
  .catch((error) => {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
