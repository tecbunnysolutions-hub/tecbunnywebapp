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
export declare function usePageContent(pageKey: string): {
    content: PageContent | null;
    loading: boolean;
    error: string | null;
    updateContent: (updates: {
        title?: string;
        content?: any;
        metaDescription?: string;
        metaKeywords?: string;
    }) => Promise<{
        success: boolean;
        data: any;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
    }>;
    refetch: () => void;
};
export declare function useAllPageContents(): {
    contents: PageContent[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
};
export {};
//# sourceMappingURL=use-page-content.d.ts.map