/**
 * useAuth hook
 * Provides the current user and permission helpers throughout the app.
 */

import { StoredUser } from "@/utils/helpers/auth.helper";
import { useStore } from "@/store/useStore";

/** Returns current user or null */
export function useAuth(): StoredUser | null {
    return useStore((s) => s.user);
}

/**
 * Returns utilities for checking the current user's permissions and shop access.
 * Admins always have full access.
 */
export function usePermissions() {
    const user = useStore((s) => s.user);

    const isAdmin = user?.role === "admin";

    /** Returns true if the user has the given permission (admins always do) */
    const can = (permission: string): boolean => {
        if (!user) return false;
        if (isAdmin) return true;
        const perms = user.permissions ?? [];
        if (permission === "view_users" && perms.includes("manage_users")) return true;
        if (permission === "view_products" && (perms.includes("add_products") || perms.includes("edit_products") || perms.includes("delete_products"))) return true;
        if (permission === "view_sales" && (perms.includes("record_sales") || perms.includes("delete_sales"))) return true;
        if (permission === "view_expenses" && (perms.includes("record_expenses") || perms.includes("edit_expenses") || perms.includes("delete_expenses"))) return true;
        if (permission === "view_services" && (perms.includes("record_services") || perms.includes("delete_services"))) return true;
        return perms.includes(permission);
    };

    /** Returns true if the user can access the given shop by its ID */
    const canAccessShop = (shopId: string | number): boolean => {
        if (!user) return false;
        if (isAdmin) return true;
        const assigned = user.assigned_shops ?? [];
        // If no shops assigned, regular user sees NOTHING
        return assigned.includes(Number(shopId));
    };

    /** Filter a list of shops to only those the user can access */
    const filterShops = <T extends { id: string | number }>(shops: T[]): T[] => {
        if (isAdmin) return shops;
        const assigned = user?.assigned_shops ?? [];
        return (shops || []).filter(s => s && assigned.includes(Number(s.id)));
    };

    return { user, isAdmin, can, canAccessShop, filterShops };
}
