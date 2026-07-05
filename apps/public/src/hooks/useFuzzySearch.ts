import { useState, useMemo, useEffect } from "react";

export function useFuzzySearch<T>(
  items: T[], 
  keys: (keyof T)[], 
  query: string
) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Debounce logic to prevent rendering on every keystroke
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 50); // extremely fast 50ms debounce for instant feel
    return () => clearTimeout(handler);
  }, [query]);

  const results = useMemo(() => {
    if (!debouncedQuery) return items;
    
    const lowerQuery = debouncedQuery.toLowerCase();
    
    return items.filter((item) => {
      return keys.some((key) => {
        const val = item[key];
        return String(val).toLowerCase().includes(lowerQuery);
      });
    });
  }, [items, keys, debouncedQuery]);

  return results;
}
