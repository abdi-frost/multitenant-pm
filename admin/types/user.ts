export interface User {
  id: string;
  email: string;
  name: string;
  userType: string;
  emailVerified: boolean;
  image?: string;
}