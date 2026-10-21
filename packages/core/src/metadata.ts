import type { Metadata } from 'next';
import { stripHtmlToPlainText } from './strings';
import { getAppSettings } from './config-db';

interface PageMetaInput {
  title: string;
  description: string;
  path: string;
  image?: string;
  /** Retained for backwards-compatible callers; keyword metadata is intentionally not emitted. */
  keywords?: string[];
  openGraph?: Metadata['openGraph'];
  twitter?: Metadata['twitter'];
}

function isUsableMetadataImage(value: string): boolean {
  return value.startsWith('/') || /^https?:\/\//i.test(value);
}

export async function cleanMetadataTitle(value: string | null | undefined): Promise<string> {
  const settings = await getAppSettings();
  const fallback = settings.fallbackTitle || 'CCTV and IT support for homes and small businesses in North Goa | TecBunny';
  const normalizeTitle = (input: string | null | undefined) =>
    stripHtmlToPlainText(input).trim().replace(/(?:\s*\|\s*TecBunny(?:\s+Solutions)?)+$/i, '').trim();

  let title = normalizeTitle(value);
  if (!title || title.toLowerCase() === 'null' || title.toLowerCase() === 'undefined') {
    title = normalizeTitle(fallback);
  }
  const suffix = ' | TecBunny';
  const maxTitleLength = /\btecbunny\b/i.test(title) ? 60 : 60 - suffix.length;
  if (title.length > maxTitleLength) {
    const cut = title.slice(0, maxTitleLength);
    const lastBreak = cut.lastIndexOf(' ');
    title = lastBreak > Math.floor(maxTitleLength * 0.7) ? cut.slice(0, lastBreak) : cut;
  }
  return /\btecbunny\b/i.test(title) ? title : `${title}${suffix}`;
}

export async function cleanMetadataDescription(
  value: string | null | undefined
): Promise<string> {
  const settings = await getAppSettings();
  const fallback = settings.defaultDescription || 'CCTV, IT support, networking and website services for homes and small businesses in North Goa and the Sawantwadi area.';

  let description = stripHtmlToPlainText(value).trim();
  if (!description || description.toLowerCase() === 'null' || description.toLowerCase() === 'undefined') {
    description = fallback;
  }
  if (description.length > 155) {
    const cut = description.slice(0, 155);
    const lastBreak = cut.lastIndexOf(' ');
    description = lastBreak > 100 ? cut.slice(0, lastBreak) : cut;
  }
  return description;
}

export async function createPageMetadata({
  title,
  description,
  path,
  image,
  openGraph,
  twitter,
}: PageMetaInput): Promise<Metadata> {
  const settings = await getAppSettings();
  const siteUrl = settings.siteUrl || 'https://www.tecbunny.com';
  const defaultOgImage = typeof settings.defaultOgImage === 'string' && isUsableMetadataImage(settings.defaultOgImage.trim())
    ? settings.defaultOgImage.trim()
    : '/opengraph-image';
  const xHandle = process.env.NEXT_PUBLIC_X_HANDLE;

  const configuredImage = image && isUsableMetadataImage(image) ? image : defaultOgImage;
  const activeImage = configuredImage === '/brand.png' || configuredImage.endsWith('/brand.png')
    ? '/opengraph-image'
    : configuredImage;
  const resolvedImage = activeImage.startsWith('http') ? activeImage : new URL(activeImage, siteUrl).toString();
  
  const rawCanonical = path.startsWith('http') ? path : `${siteUrl}${path}`;
  const urlObj = new URL(rawCanonical);
  let canonicalPath = urlObj.pathname.toLowerCase().replace(new RegExp('/+', 'g'), '/');
  if (canonicalPath.endsWith('/') && canonicalPath !== '/') {
    canonicalPath = canonicalPath.slice(0, -1);
  }
  const canonical = `${siteUrl}${canonicalPath}`;

  const safeTitle = await cleanMetadataTitle(title);
  const safeDescription = await cleanMetadataDescription(description);

  return {
    title: safeTitle,
    description: safeDescription,
    alternates: {
      canonical,
    },
    openGraph: {
      ...(openGraph && typeof openGraph === 'object' ? openGraph : {}),
      title: safeTitle,
      description: safeDescription,
      type: 'website',
      siteName: 'TecBunny Solutions',
      url: canonical,
      images: [
        {
          url: resolvedImage,
          width: 1200,
          height: 630,
          alt: safeTitle,
        },
      ],
    },
    twitter: {
      ...(twitter && typeof twitter === 'object' ? twitter : {}),
      card: 'summary_large_image',
      title: safeTitle,
      description: safeDescription,
      images: [resolvedImage],
      site: xHandle,
      creator: xHandle,
    },
  };
}
