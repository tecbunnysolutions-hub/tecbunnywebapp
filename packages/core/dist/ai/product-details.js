export async function fetchAiProductDetails(input) {
    const response = await fetch('/api/ai/product-details', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || result?.error) {
        throw new Error(result?.error || 'Failed to fetch product details');
    }
    return (result?.details ?? result);
}
export function formatAiSpecifications(specifications) {
    if (!specifications) {
        return '';
    }
    return Object.entries(specifications)
        .map(([key, value]) => `${key}:${value}`)
        .join(', ');
}
