import { trpc } from '../components/providers/TRPCProvider';

interface PageContent {
  id: string;
  page_key: string;
  title: string;
  content: any;
  meta_description?: string;
  meta_keywords?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export function usePageContent(pageKey: string) {
  const { data, isLoading, error, refetch } = trpc.pageContent.get.useQuery(
    { key: pageKey },
    { enabled: !!pageKey, refetchOnWindowFocus: false }
  );

  const mutation = trpc.pageContent.update.useMutation({
    onSuccess: () => {
      refetch();
    }
  });

  const updateContent = async (updates: {
    title?: string;
    content?: any;
    metaDescription?: string;
    metaKeywords?: string;
  }) => {
    try {
      const result = await mutation.mutateAsync({
        pageKey,
        title: updates.title,
        content: updates.content,
        metaDescription: updates.metaDescription,
        metaKeywords: updates.metaKeywords,
      });
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  return {
    content: data as PageContent | null,
    loading: isLoading || mutation.isLoading,
    error: error ? error.message : null,
    updateContent,
    refetch: async () => { await refetch(); }
  };
}

export function useAllPageContents() {
  const { data, isLoading, error, refetch } = trpc.pageContent.list_all.useQuery(
    undefined,
    { refetchOnWindowFocus: false }
  );

  return {
    contents: (data || []) as PageContent[],
    loading: isLoading,
    error: error ? error.message : null,
    refetch: async () => { await refetch(); }
  };
}
