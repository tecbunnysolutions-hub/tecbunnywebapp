import { useState, useCallback, useEffect } from 'react';

export function useAllPageContents() {
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/page-content');
      if (!res.ok) throw new Error('Failed to fetch page contents');
      const data = await res.json();
      // Assuming data from /api/page-content returns { data: [...] } or just an array
      setContents(data.data || data || []);
      setError(null);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { contents, loading, error, refetch };
}
