'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import Image from 'next/image';
import { cn } from '../../lib/utils';
import { logger } from '@tecbunny/core';
// Check if the image is from Supabase Storage
const isSupabaseUrl = (url) => {
    if (!url || typeof url !== 'string')
        return false;
    return url.includes('supabase.co/storage') || url.includes('.storage.supabase.co');
};
// Generate Supabase URL with transformations (basic optimization)
const getOptimizedUrl = (src, transformation) => {
    if (!src || typeof src !== 'string')
        return src || '';
    // For Supabase URLs, we can add basic query parameters for optimization
    if (isSupabaseUrl(src)) {
        try {
            const url = new URL(src);
            // Add basic optimization parameters
            if (transformation?.width)
                url.searchParams.set('width', transformation.width.toString());
            if (transformation?.height)
                url.searchParams.set('height', transformation.height.toString());
            if (transformation?.quality)
                url.searchParams.set('quality', transformation.quality.toString());
            return url.toString();
        }
        catch (error) {
            logger.warn('Failed to parse Supabase URL', { error, src, context: 'OptimizedImage.getOptimizedSrc' });
            return src;
        }
    }
    // For other URLs, return as-is
    return src;
};
export function OptimizedImage({ src, alt, width, height, fill = false, sizes, className, priority = false, quality = 75, placeholder = 'empty', blurDataURL, transformation, fallbackSrc = 'https://placehold.co/600x400.png', onError, ...props }) {
    const [imgSrc, setImgSrc] = React.useState(src);
    const [hasError, setHasError] = React.useState(false);
    // Reset error state when src changes
    React.useEffect(() => {
        setHasError(false);
        setImgSrc(src);
    }, [src]);
    const handleError = React.useCallback((event) => {
        onError?.(event);
        if (!hasError) {
            logger.warn('Failed to load image', { imgSrc, context: 'OptimizedImage.handleError' });
            setHasError(true);
            const safeFallback = (imgSrc && imgSrc.startsWith('data:image/svg')) ? 'https://placehold.co/600x400.png' : fallbackSrc;
            setImgSrc(safeFallback);
        }
    }, [fallbackSrc, hasError, imgSrc, onError]);
    // Get optimized URL
    const optimizedSrc = React.useMemo(() => {
        if (hasError)
            return fallbackSrc;
        const optimizationParams = {
            ...transformation,
            width: width || transformation?.width,
            height: height || transformation?.height,
            quality,
        };
        return getOptimizedUrl(imgSrc, optimizationParams);
    }, [imgSrc, transformation, width, height, quality, hasError, fallbackSrc]);
    // Next.js image optimizer strictly requires a valid image content-type.
    // Extensionless URLs from Supabase or S3 often return application/octet-stream,
    // causing the optimizer to reject them and trigger a 400 Bad Request error.
    const isExtensionless = React.useMemo(() => {
        try {
            const url = new URL(optimizedSrc);
            return !/\.(png|jpe?g|webp|gif|avif|bmp|svg)$/i.test(url.pathname);
        }
        catch {
            return !/\.(png|jpe?g|webp|gif|avif|bmp|svg)$/i.test(optimizedSrc);
        }
    }, [optimizedSrc]);
    const imageProps = {
        src: optimizedSrc,
        className: cn(className),
        priority,
        quality,
        placeholder,
        blurDataURL,
        onError: handleError,
        unoptimized: props.unoptimized || isExtensionless,
        ...props,
    };
    if (hasError || !src || src.includes('placehold.co') || src.includes('placeholder')) {
        return (_jsxs("div", { className: cn("relative w-full h-full min-h-[120px] rounded-xl bg-muted/30 border border-border flex flex-col items-center justify-center gap-3 overflow-hidden shadow-inner", className), children: [_jsx("div", { className: "absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" }), _jsx("div", { className: "absolute -left-12 -top-12 h-24 w-24 rounded-full bg-primary/5 blur-xl pointer-events-none" }), _jsx("div", { className: "absolute -right-12 -bottom-12 h-24 w-24 rounded-full bg-primary/5 blur-xl pointer-events-none" }), _jsx("div", { className: "relative z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary shadow-[0_0_15px_rgba(37,99,235,0.1)]", children: _jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.75", strokeLinecap: "round", strokeLinejoin: "round", className: "h-6 w-6", children: [_jsx("rect", { x: "2", y: "2", width: "20", height: "8", rx: "2", ry: "2" }), _jsx("rect", { x: "2", y: "14", width: "20", height: "8", rx: "2", ry: "2" }), _jsx("line", { x1: "6", y1: "6", x2: "6.01", y2: "6" }), _jsx("line", { x1: "6", y1: "18", x2: "6.01", y2: "18" }), _jsx("line", { x1: "10", y1: "6", x2: "14", y2: "6" })] }) }), _jsx("span", { className: "relative z-10 text-[9px] font-bold font-tech uppercase tracking-widest text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded truncate max-w-[90%]", children: alt || "Hardware" })] }));
    }
    if (fill) {
        return (_jsx(Image, { ...imageProps, alt: alt, fill: true, sizes: sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw', blurDataURL: blurDataURL || undefined }));
    }
    if (width && height) {
        return (_jsx(Image, { ...imageProps, alt: alt, width: width, height: height, sizes: sizes, blurDataURL: blurDataURL || undefined }));
    }
    // Fallback to fill if no dimensions specified
    return (_jsx(Image, { ...imageProps, alt: alt, fill: true, sizes: sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw', blurDataURL: blurDataURL || undefined }));
}
