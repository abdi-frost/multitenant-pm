export enum UserType {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  TENANT_ADMIN = 'TENANT_ADMIN',
  MEMBER = 'MEMBER',
}

export interface User {
  id: string;
  email: string;
  name: string;
  userType: UserType;
  role: UserRole;
  emailVerified: boolean;
  image?: string | null;
  approved: boolean;
  createdAt: Date;
  updatedAt: Date;
}