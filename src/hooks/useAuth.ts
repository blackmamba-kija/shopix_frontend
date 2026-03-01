/**
 * useAuth hook
 * Provides the current user and permission helpers throughout the app.
 */

import { authHelper, StoredUser } from "@/utils/helpers/auth.helper";

/** Returns current user or null */
export function useAuth(): StoredUser | null {
    return authHelper.getUser();
}

/**
 * Returns utilities for checking the current user's permissions and shop access.
 * Admins always have full access.
 */
export function usePermissions() {
    const user = authHelper.getUser();

    const isAdmin = user?.role === "admin";

    /** Returns true if the user has the given permission (admins always do) */
    const can = (permission: string): boolean => {
        if (!user) return false;
        if (isAdmin) return true;
        return (user.permissions ?? []).includes(permission);
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
