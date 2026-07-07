import { EFFECTIVE_PERMISSIONS, ROLE_DISPLAY_NAME, isAtLeast } from './roles';
// Client-side permission functions that work with our custom User type
// These are synchronous and work with the role that's already loaded in the user object
export function isCustomerClient(user) {
    return user?.role === 'customer';
}
export function isSalesClient(user) {
    if (!user?.role)
        return false;
    return isAtLeast(user.role, 'sales_executive');
}
export function isAccountsClient(user) {
    if (!user?.role)
        return false;
    return isAtLeast(user.role, 'accounts');
}
export function isManagerClient(user) {
    if (!user?.role)
        return false;
    return isAtLeast(user.role, 'sales_manager') || isAtLeast(user.role, 'service_manager');
}
export function isAdminClient(user) {
    if (!user?.role)
        return false;
    return isAtLeast(user.role, 'admin');
}
export function hasRoleClient(user, requiredRole) {
    if (!user?.role)
        return false;
    return isAtLeast(user.role, requiredRole);
}
export function getRoleDisplayName(role) { return ROLE_DISPLAY_NAME[role]; }
export function getUserPermissions(role) { return Array.from(EFFECTIVE_PERMISSIONS[role]); }
export function isSuperadminClient(user) {
    return user?.role === 'superadmin';
}
