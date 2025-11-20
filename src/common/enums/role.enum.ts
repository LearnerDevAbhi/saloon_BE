export enum UserRole {
  CUSTOMER = 'customer',
  STAFF = 'staff',
  ADMIN = 'admin',
}

export const ADMIN_ROLES = [UserRole.ADMIN];
export const STAFF_ROLES = [UserRole.STAFF, UserRole.ADMIN];
