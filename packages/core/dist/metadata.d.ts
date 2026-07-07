import type { Metadata } from 'next';
interface PageMetaInput {
    title: string;
    description: string;
    path: string;
    image?: string;
    keywords?: string[];
    openGraph?: Metadata['openGraph'];
    twitter?: Metadata['twitter'];
}
export declare function cleanMetadataTitle(value: string | null | undefined): Promise<string>;
export declare function cleanMetadataDescription(value: string | null | undefined): Promise<string>;
export declare function createPageMetadata({ title, description, path, image, keywords, openGraph, twitter, }: PageMetaInput): Promise<Metadata>;
export {};
//# sourceMappingURL=metadata.d.ts.map