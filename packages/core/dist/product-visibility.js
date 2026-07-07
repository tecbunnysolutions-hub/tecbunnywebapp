import { stripHtmlToPlainText } from "./strings";
function toPositiveNumber(value) {
    if (typeof value === 'number')
        return Number.isFinite(value) && value > 0 ? value : null;
    if (typeof value === 'string' && value.trim()) {
        const parsed = Number(value);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    }
    return null;
}
function firstPositive(product, keys) {
    for (const key of keys) {
        const value = toPositiveNumber(product[key]);
        if (value !== null)
            return value;
    }
    return null;
}
function hasPublicDescription(product) {
    const raw = product.description ?? product.body_html ?? product.details;
    if (typeof raw !== 'string')
        return false;
    return stripHtmlToPlainText(raw, 200).trim().length > 0;
}
export function isPubliclyVisibleProduct(product) {
    if (!product)
        return false;
    const status = typeof product.status === 'string' ? product.status.trim().toLowerCase() : '';
    const isActive = !status || status === 'active' || status === 'published';
    const isNotDeleted = product.is_deleted !== true && product.deleted_at == null;
    const hasSalePrice = firstPositive(product, ['price', 'selling_price', 'sale_price', 'offer_price', 'discount_price', 'unit_price']) !== null;
    return isActive && isNotDeleted && hasSalePrice;
}
export function filterPubliclyVisibleProducts(products) {
    return products.filter(isPubliclyVisibleProduct);
}
