export interface User {
  id: string;
  email: string;
  name: string;
  userType: string;
  role: string;
  emailVerified: boolean;
  image?: string | null;
  approved: boolean;
  createdAt: Date;
  updatedAt: Date;
}