import * as React from 'react';
import { type ImageProps } from 'next/image';
interface OptimizedImageProps extends Omit<ImageProps, 'src' | 'alt' | 'width' | 'height' | 'fill' | 'quality' | 'placeholder' | 'blurDataURL'> {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    fill?: boolean;
    sizes?: string;
    className?: string;
    priority?: boolean;
    quality?: number;
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    transformation?: Record<string, unknown>;
    fallbackSrc?: string;
    onError?: React.ReactEventHandler<HTMLImageElement>;
}
export declare function OptimizedImage({ src, alt, width, height, fill, sizes, className, priority, quality, placeholder, blurDataURL, transformation, fallbackSrc, onError, ...props }: OptimizedImageProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=optimized-image.d.ts.map