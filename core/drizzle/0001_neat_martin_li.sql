CREATE TABLE "invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenantId" varchar(36) NOT NULL,
	"organizationId" uuid NOT NULL,
	"email" varchar(256) NOT NULL,
	"role" varchar(50) DEFAULT 'STAFF' NOT NULL,
	"invitedBy" text NOT NULL,
	"invitationToken" varchar(512) NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"acceptedAt" timestamp with time zone,
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"metadata" json,
	"deleted" boolean DEFAULT false NOT NULL,
	"deletedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invitations_id_unique" UNIQUE("id"),
	CONSTRAINT "invitations_invitationToken_unique" UNIQUE("invitationToken")
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"tenantId" varchar(36) NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" varchar(1024),
	"logoUrl" varchar(512),
	"website" varchar(512),
	"industry" varchar(100),
	"size" varchar(50),
	"preferences" json,
	"isActive" boolean DEFAULT true NOT NULL,
	"metadata" json,
	"deleted" boolean DEFAULT false NOT NULL,
	"deletedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "admins" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "employees" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "invitation" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "member" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "organization" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "admins" CASCADE;--> statement-breakpoint
DROP TABLE "employees" CASCADE;--> statement-breakpoint
DROP TABLE "invitation" CASCADE;--> statement-breakpoint
DROP TABLE "member" CASCADE;--> statement-breakpoint
DROP TABLE "organization" CASCADE;--> statement-breakpoint
ALTER TABLE "session" DROP CONSTRAINT "session_token_unique";--> statement-breakpoint
ALTER TABLE "tenants" DROP CONSTRAINT "tenants_ownerId_user_id_fk";
--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "userId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "accountId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "providerId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "createdAt" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "userId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "expiresAt" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "ipAddress" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "createdAt" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "tenants" ALTER COLUMN "approvedBy" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "tenants" ALTER COLUMN "rejectedBy" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "email" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "image" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "createdAt" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "userType" SET DEFAULT 'TENANT';--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "identifier" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "expiresAt" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "createdAt" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "expiresAt" timestamp;--> statement-breakpoint
ALTER TABLE "onboarding_requests" ADD COLUMN "companyDetails" json;--> statement-breakpoint
ALTER TABLE "onboarding_requests" ADD COLUMN "businessType" varchar(100);--> statement-breakpoint
ALTER TABLE "onboarding_requests" ADD COLUMN "expectedUsers" integer;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "rejectionReason" text;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "subscriptionTier" varchar(50) DEFAULT 'FREE';--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "maxEmployees" integer DEFAULT 5;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "maxProjects" integer DEFAULT 10;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "subscriptionExpiresAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "tenantId" varchar(36);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "organizationId" uuid;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_tenantId_tenants_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invitedBy_user_id_fk" FOREIGN KEY ("invitedBy") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_tenantId_tenants_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_tenantId_tenants_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "accessTokenExpiresAt";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "refreshTokenExpiresAt";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "scope";--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN "token";--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN "activeOrganizationId";--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN "impersonatedBy";--> statement-breakpoint
ALTER TABLE "tenants" DROP COLUMN "ownerId";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "banned";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "banReason";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "banExpires";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "firstName";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "lastName";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "profilePictureUrl";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "invitedBy";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "invitationAcceptedAt";