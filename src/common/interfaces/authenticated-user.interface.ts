import { UserRole } from '../enums/role.enum';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: UserRole;
}
