/**
 * Shop Types
 * Define all available shop types
 */

export enum ShopType {
  COSMETICS = "cosmetics",
  STATIONERY = "stationery",
}

export const SHOP_TYPES_LABELS = {
  [ShopType.COSMETICS]: "Cosmetics",
  [ShopType.STATIONERY]: "Stationery",
} as const;

export const SHOP_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
} as const;
