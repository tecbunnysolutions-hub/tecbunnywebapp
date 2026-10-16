import { STARTING_PRICES, type StartingPrice } from '@/content/pricing';

export const STARTING_PRICES_KEY = 'starting_prices';

const isValidPrice = (value: unknown): value is StartingPrice => {
  if (!value || typeof value !== 'object') return false;
  const price = value as Record<string, unknown>;
  return typeof price.id === 'string' && price.id.length > 0
    && typeof price.service === 'string'
    && typeof price.label === 'string'
    && typeof price.summary === 'string'
    && typeof price.href === 'string' && price.href.startsWith('/')
    && typeof price.amount === 'number' && Number.isFinite(price.amount) && price.amount > 0;
};

/** Admin-edited prices from the settings API, falling back to the defaults in content/pricing.ts. */
export async function getStartingPrices(): Promise<readonly StartingPrice[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.tecbunny.com';
  try {
    const response = await fetch(`${apiUrl}/api/settings?key=${STARTING_PRICES_KEY}`, {
      next: { revalidate: 60, tags: ['content', 'content:starting-prices'] },
    });
    if (!response.ok) return STARTING_PRICES;
    const { value } = (await response.json()) as { value?: unknown };
    if (!Array.isArray(value) || value.length === 0) return STARTING_PRICES;
    const valid = value.filter(isValidPrice);
    return valid.length > 0 ? valid : STARTING_PRICES;
  } catch {
    return STARTING_PRICES;
  }
}
