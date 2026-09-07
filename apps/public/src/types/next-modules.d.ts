declare module 'next' {
  export type Metadata = Record<string, unknown>;
  export type Viewport = Record<string, unknown>;
  export namespace MetadataRoute {
    type Robots = unknown;
    type Sitemap = unknown;
  }
}

declare module 'next/link' {
  const Link: any;
  export default Link;
}

declare module 'next/image' {
  const Image: any;
  export default Image;
}

declare module 'next/dynamic' {
  const dynamic: any;
  export default dynamic;
}

declare module 'next/navigation' {
  export function useRouter(): any;
  export function useSearchParams(): any;
  export function useParams<T extends Record<string, string | string[] | undefined> = Record<string, string | string[] | undefined>>(): T;
  export function usePathname(): string;
  export function redirect(url: string): never;
  export function notFound(): never;
}

declare module 'next/headers' {
  export function headers(): Promise<any>;
  export function cookies(): Promise<any>;
}

declare module 'next/server' {
  export type NextRequest = Request & { nextUrl: URL; cookies: any };
  export const NextRequest: any;
  export type NextResponse = Response;
  export const NextResponse: any;
}

declare module 'next/script' {
  const Script: any;
  export default Script;
}
