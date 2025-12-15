import { NextResponse } from "next/server";
import { db } from "@/db";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { users } from "@/db/schema";
import { UserRole, UserType } from "@/types/entityEnums";
import { ResponseFactory } from "@/types/response";
import { notFound } from "next/navigation";

export async function POST() {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME ?? "Admin";

    if (!email || !password) {
        return NextResponse.json(null, { status: 404 });
    }

    const existingAdmin = await db.query.users.findFirst({
        where: and(
            eq(users.email, email),
            eq(users.role, UserRole.SUPER_ADMIN),
            eq(users.userType, UserType.ADMIN)
        )
    });

    if (existingAdmin) {
        notFound();
    }

    try {
        const result = await db.transaction(async (tx) => {

            const signUpResult = await auth.api.signUpEmail({
                body: { name, email, password }
            });

            if (!signUpResult?.user?.id) {
                throw new Error("Failed to create admin in Better-Auth");
            }

            const userId = signUpResult.user.id;

            // approve in your DB
            const updatedUser = await tx.update(users)
                .set({
                    emailVerified: true,
                    role: UserRole.SUPER_ADMIN,
                    approved: true,
                    tenantId: null,
                    userType: UserType.ADMIN
                })
                .where(eq(users.id, userId))
                .returning();

            return updatedUser;
        });

        return NextResponse.json(ResponseFactory.createDataResponse(
            result, "Super Admin user created successfully"
        ), { status: 201 });

    } catch (err) {
        console.error("Admin bootstrap failed:", err);
        // Transaction rollback happens automatically
        return NextResponse.json(ResponseFactory.createErrorResponse(
            "Failed to create Super Admin user"
        ), { status: 500 });
    }
}
