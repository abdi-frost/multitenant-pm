import { db } from '@/db/schemas/index';
import { userTable } from '@/db/schema';
import { UserType } from '@/types/entityEnums';
import { eq } from 'drizzle-orm';
import * as dotenv from "dotenv";
import { auth } from '@/lib/auth';

dotenv.config({ path: "../.env" });

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'abdimegersa14@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'P@ssw0rd';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Super Admin';

/**
 * Seed Admin User
 * 
 * Creates an admin account using Better Auth API
 * Better Auth uses scrypt for password hashing (memory-hard, CPU-intensive)
 * 
 * Admins:
 * - Can only login with email/password (no social auth)
 * - Have full access to admin panel
 * - Can approve/reject tenants
 * - Are not associated with any tenant
 */
async function seedAdmin() {
    console.log('🔍 Checking for existing admin...');

    // Check if admin already exists
    const existing = await db.query.userTable.findFirst({
        where: (t, { eq }) => eq(t.email, ADMIN_EMAIL),
    });

    if (existing) {
        console.log('✅ Admin already exists:', ADMIN_EMAIL);
        return;
    }

    console.log('📝 Creating admin user with Better Auth...');

    try {
        // Use Better Auth's sign-up API to create admin
        // This ensures password is hashed with scrypt correctly
        const result = await auth.api.signUpEmail({
            body: {
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD,
                name: ADMIN_NAME,
            },
        });

        if (!result || !result.user) {
            throw new Error('Failed to create admin user');
        }

        console.log('📝 Updating user type to ADMIN...');

        // Update the user to be an ADMIN type
        await db.update(userTable)
            .set({
                userType: UserType.ADMIN,
                emailVerified: true,
                role: null,
                tenantId: null,
                organizationId: null,
            })
            .where(eq(userTable.id, result.user.id));

        console.log('✅ Admin created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email:', ADMIN_EMAIL);
        console.log('🔑 Password:', ADMIN_PASSWORD);
        console.log('⚠️  Please change the password after first login!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🚀 You can now login at:', process.env.ADMIN_APP_URL || 'http://localhost:3002');
    } catch (error) {
        console.error('❌ Error creating admin:', error);
        throw error;
    }
}

seedAdmin().catch((error: Error) => {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
});