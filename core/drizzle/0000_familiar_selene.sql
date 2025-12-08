CREATE TABLE "account" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"userId" varchar(36) NOT NULL,
	"accountId" varchar(256) NOT NULL,
	"providerId" varchar(50) NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"accessTokenExpiresAt" timestamp with time zone,
	"refreshTokenExpiresAt" timestamp with time zone,
	"scope" text,
	"idToken" text,
	"password" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(256) NOT NULL,
	"password" varchar(512) NOT NULL,
	"role" varchar(50) DEFAULT 'ADMIN' NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"metadata" json,
	"deleted" boolean DEFAULT false NOT NULL,
	"deletedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admins_id_unique" UNIQUE("id"),
	CONSTRAINT "admins_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"tenantId" varchar(36) NOT NULL,
	"organizationId" uuid NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"firstName" varchar(256) NOT NULL,
	"lastName" varchar(256) NOT NULL,
	"email" varchar(256) NOT NULL,
	"role" varchar(50) DEFAULT 'STAFF' NOT NULL,
	"password" varchar(512) NOT NULL,
	"resetPasswordToken" varchar(512),
	"resetPasswordTokenExpiry" date,
	"profilePictureUrl" varchar(512),
	"isActive" boolean DEFAULT true NOT NULL,
	"metadata" json,
	"deleted" boolean DEFAULT false NOT NULL,
	"deletedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "employees_id_unique" UNIQUE("id"),
	CONSTRAINT "employees_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "invitation" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"email" varchar(256) NOT NULL,
	"inviterId" varchar(36) NOT NULL,
	"organizationId" varchar(36) NOT NULL,
	"role" varchar(50) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"userId" varchar(36) NOT NULL,
	"organizationId" varchar(36) NOT NULL,
	"role" varchar(50) DEFAULT 'member' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "onboarding_requests" (
	"tenantId" varchar(36) NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"description" varchar(1024),
	"isActive" boolean DEFAULT true NOT NULL,
	"metadata" json,
	"deleted" boolean DEFAULT false NOT NULL,
	"deletedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "onboarding_requests_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"slug" varchar(256) NOT NULL,
	"logo" varchar(512),
	"metadata" json,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"tenantId" varchar(36),
	"description" varchar(1024),
	"preferences" json,
	CONSTRAINT "organization_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"userId" varchar(36) NOT NULL,
	"token" varchar(512) NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"ipAddress" varchar(45),
	"userAgent" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"activeOrganizationId" varchar(36),
	"impersonatedBy" varchar(36),
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"ownerId" varchar(36),
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"requestedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"approvedAt" timestamp with time zone,
	"approvedBy" varchar(36),
	"rejectedAt" timestamp with time zone,
	"rejectedBy" varchar(36),
	"isActive" boolean DEFAULT true NOT NULL,
	"metadata" json,
	"deleted" boolean DEFAULT false NOT NULL,
	"deletedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tenants_id_unique" UNIQUE("id"),
	CONSTRAINT "tenants_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"email" varchar(256) NOT NULL,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"image" varchar(512),
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"role" varchar(50) DEFAULT 'user' NOT NULL,
	"banned" boolean DEFAULT false,
	"banReason" text,
	"banExpires" timestamp with time zone,
	"userType" varchar(20) DEFAULT 'EMPLOYEE' NOT NULL,
	"firstName" varchar(256),
	"lastName" varchar(256),
	"profilePictureUrl" varchar(512),
	"invitedBy" varchar(36),
	"invitationAcceptedAt" timestamp with time zone,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"identifier" varchar(256) NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_tenantId_tenants_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviterId_member_id_fk" FOREIGN KEY ("inviterId") REFERENCES "public"."member"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organizationId_organization_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_organizationId_organization_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboarding_requests" ADD CONSTRAINT "onboarding_requests_tenantId_tenants_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_ownerId_user_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_approvedBy_user_id_fk" FOREIGN KEY ("approvedBy") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_rejectedBy_user_id_fk" FOREIGN KEY ("rejectedBy") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;