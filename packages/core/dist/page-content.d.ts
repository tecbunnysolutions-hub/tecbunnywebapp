export interface PageContent {
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
export declare function getPageContentServer(pageKey: string): Promise<PageContent | null>;
//# sourceMappingURL=page-content.d.ts.map