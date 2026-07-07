import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
/**
 * Utility function to merge Tailwind CSS classes with conditional logic
 * Combines clsx for conditional classes and tailwind-merge for proper class merging
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
export function revealDelayClass(delayMs) {
    const normalizedDelay = Math.max(0, Math.min(1000, Math.round(delayMs / 10) * 10));
    return `reveal-delay-${normalizedDelay}`;
}
/**
 * Formats a number as currency (Indian Rupees)
 */
export function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
}
/**
 * Formats a number with Indian number system (lakhs, crores)
 */
export function formatNumber(num) {
    return new Intl.NumberFormat('en-IN').format(num);
}
/**
 * Truncates text to a specified length with ellipsis
 */
export function truncateText(text, maxLength) {
    if (text.length <= maxLength)
        return text;
    return `${text.slice(0, maxLength - 3)}...`;
}
/**
 * Generates a random string of specified length
 */
export function generateRandomString(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
/**
 * Validates email format
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
/**
 * Validates Indian mobile number format
 */
export function isValidMobile(mobile) {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(mobile);
}
const DEFAULT_CATEGORY_GST_RATES = {
    Electronics: 18,
    Accessories: 18,
    Books: 5,
    Clothing: 12,
    Food: 5,
    Health: 12,
    Home: 18,
    Sports: 18,
    Software: 18,
    Services: 18,
    Gaming: 18,
    Furniture: 18,
    Automotive: 28,
};
/**
 * Gets the GST rate for a specific category
 * Falls back to 18% for unknown categories
 */
export function getGstRateForCategory(category, categoryGstRates) {
    if (!category)
        return 18; // Default rate for empty/undefined category
    const rates = categoryGstRates || DEFAULT_CATEGORY_GST_RATES;
    // Try exact match first
    if (rates[category] !== undefined) {
        return rates[category];
    }
    // Try case-insensitive match
    const categoryLower = category.toLowerCase();
    for (const [cat, rate] of Object.entries(rates)) {
        if (cat.toLowerCase() === categoryLower) {
            return rate;
        }
    }
    // Default to 18% GST for unknown categories
    return 18;
}
/**
 * Gets the GST rate for a product, prioritizing product-specific rate over category rate
 */
export function getGstRateForProduct(product, categoryGstRates) {
    // If product has a specific GST rate, use it
    if (product.gstRate !== undefined && product.gstRate !== null && product.gstRate >= 0) {
        return product.gstRate;
    }
    // Otherwise, use category-based rate
    return getGstRateForCategory(product.category || '', categoryGstRates);
}
/**
 * Calculates GST amount for a given price and rate
 */
export function calculateGstAmount(price, gstRate) {
    return Math.round((price * gstRate) / 100 * 100) / 100; // Round to 2 decimal places
}
/**
 * Calculates total amount including GST
 */
export function calculateTotalWithGst(price, gstRate) {
    return price + calculateGstAmount(price, gstRate);
}
