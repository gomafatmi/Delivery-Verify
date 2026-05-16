export type UserRole = "amazon_admin" | "delivery_person" | "customer";

export interface User {
  id: string;
  role: UserRole;
  email: string;
  name: string;
  phone: string | null;
  createdAt: Date;
}

export interface CreateUserInput {
  role: UserRole;
  email: string;
  name: string;
  phone?: string;
  password: string;
}
