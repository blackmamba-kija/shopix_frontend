/**
 * User Roles
 * Define all available user roles in the application
 */

export enum UserRole {
  ADMIN = "admin",
  SELLER = "seller",
}

export const ROLE_PERMISSIONS = {
  [UserRole.ADMIN]: [
    "user:manage",
    "shop:manage",
    "product:manage",
    "sales:manage",
    "reports:view",
    "settings:manage",
  ],
  [UserRole.SELLER]: [
    "shop:view",
    "shop:edit-own",
    "product:manage",
    "sales:manage",
    "reports:view-own",
  ],
} as const;
