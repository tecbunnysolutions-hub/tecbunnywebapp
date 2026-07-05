'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, RefreshCw, Share2, Shield, Truck } from 'lucide-react';
import Image from 'next/image';
import { sanitizeHtml } from '@/lib/sanitize-html';

import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { Button } from "@tecbunny/ui";
import { Card, CardContent } from "@tecbunny/ui";
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import { logger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/client';
import { isPubliclyVisibleProduct } from '@/lib/product-visibility';
import { getAllProductImages } from '@/lib/image-utils';
import type { Product } from '@/lib/types';
import { useAnalytics } from '../../hooks/use-analytics';
import { useToast } from "@tecbunny/ui";
import { useBehavioralCRO } from '../../hooks/use-behavioral-cro';
import { StarRating } from './StarRating';

interface ProductDetailPageProps {
  productId: string;
  initialProduct?: any;
  sourceContext?: {
    source: string;
    ref: string | null;
    platform: string;
    timestamp: number;
  } | null;
}

export function ProductDetailPage({ productId, initialProduct, sourceContext }: ProductDetailPageProps) {
  const router = useRouter();
  const { trackEvent } = useAnalytics();
  const { toast } = useToast();
  const { showAssistance, triggerContext, dismissAssistance } = useBehavioralCRO();
  const isMountedRef = useRef(true);

  const [pincode, setPincode] = useState<string>('');
  const [showPincodeInput, setShowPincodeInput] = useState<boolean>(false);
  const [deliveryInfo, setDeliveryInfo] = useState<{
    locationName: string;
    isGoa: boolean;
    hasEstimated: boolean;
  }>({
    locationName: '',
    isGoa: false,
    hasEstimated: false
  });

  useEffect(() => {
    const savedPincode = localStorage.getItem('tb_delivery_pincode');
    if (savedPincode && savedPincode.length === 6) {
      setPincode(savedPincode);
      const isGoa = savedPincode.startsWith('403');
      setDeliveryInfo({
        locationName: isGoa ? 'Goa' : 'Out of State',
        isGoa,
        hasEstimated: true
      });
    } else {
      setDeliveryInfo({
        locationName: 'Goa (Default)',
        isGoa: true,
        hasEstimated: false
      });
    }
  }, []);

  const handlePincodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length === 6 && /^\d+$/.test(pincode)) {
      const isGoa = pincode.startsWith('403');
      localStorage.setItem('tb_delivery_pincode', pincode);
      setDeliveryInfo({
        locationName: isGoa ? 'Goa' : 'Out of State',
        isGoa,
        hasEstimated: true
      });
      setShowPincodeInput(false);
      toast({
        title: 'Delivery Estimate Updated',
        description: isGoa 
          ? 'Next-day delivery available from our Parse Hub in Pernem!' 
          : 'Standard shipping of 4-5 days from Mumbai/Bangalore network.',
        variant: 'default',
      });
    } else {
      toast({
        title: 'Invalid Pincode',
        description: 'Please enter a valid 6-digit Indian PIN code.',
        variant: 'destructive',
      });
    }
  };

  const initialEnrichedProduct = useMemo(() => {
    if (initialProduct) {
      const p = initialProduct;
      
      // Apply source-aware pricing logic
      let discountMultiplier = 1;
      if (sourceContext?.source === 'certified-agents') {
        discountMultiplier = 0.95; // 5% specialized discount for certified agent traffic
      } else if (sourceContext?.platform === 'app-link') {
        discountMultiplier = 0.98; // 2% app-referral discount
      }

      const resolvedTitle = [p.title, p.name]
        .map((value) => (typeof value === 'string' ? value.trim() : ''))
        .find((value) => value.length > 0) || 'Product';

      const rawHsn =
        p.hsnCode ??
        (p as any).hsn_code ??
        (p as any).hsn ??
        (p as any).hsn_sac ??
        null;
      const rawGst =
        p.gstRate ??
        (p as any).gst_rate ??
        (p as any).gst_percentage ??
        null;

      let resolvedGst: number | undefined;
      if (typeof rawGst === 'number' && Number.isFinite(rawGst)) {
        resolvedGst = rawGst;
      } else if (typeof rawGst === 'string') {
        const parsed = Number.parseFloat(rawGst);
        resolvedGst = Number.isFinite(parsed) ? parsed : undefined;
      }

      const resolvedHsn = typeof rawHsn === 'string' && rawHsn.trim().length > 0
        ? rawHsn.trim()
        : undefined;

      const gstRate = resolvedGst ?? 18;
      const rawPrice = typeof p.price === 'number' ? p.price : Number(p.price) || 0;
      const rawMrp = typeof p.mrp === 'number' ? p.mrp : Number(p.mrp) || (rawPrice * 1.2);
      
      const priceNum = rawPrice;
      const mrpNum = rawMrp;

      return {
        ...p,
        title: resolvedTitle,
        name: resolvedTitle,
        price: priceNum,
        mrp: mrpNum,
        hsnCode: resolvedHsn,
        gstRate: gstRate,
      } as Product;
    }
    return null;
  }, [initialProduct]);

  const [product, setProduct] = useState<Product | null>(initialEnrichedProduct);
  const [loading, setLoading] = useState(!initialProduct);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'specs' | 'description' | 'warranty'>('specs');
  const supabase = createClient();
  const displayName = product?.title || product?.name || 'Product';

  const skuValue = useMemo(() => {
    if (!product) return '';
    return product.handle || product.barcode || product.id;
  }, [product]);

  const productImages = useMemo(() => {
    if (!product) return [];

    const uniqueImages = getAllProductImages(product);

    const toPngPlaceholder = (size: string = '600x600') =>
      `https://placehold.co/${size}/0066cc/ffffff.png?text=Product+Image`;
    const ensurePng = (url: string): string => {
      if (!url) return toPngPlaceholder();
      try {
        if (url.endsWith('.svg') || url.includes('image/svg+xml') || url.startsWith('data:image/svg+xml')) {
          return toPngPlaceholder();
        }
        if (url.includes('placehold.co')) {
          const u = new URL(url);
          const hasRasterExt = /\.(png|jpg|jpeg|webp)$/i.test(u.pathname);
          if (!hasRasterExt) {
            u.pathname = `${u.pathname}.png`;
          }
          return u.toString();
        }
        return url;
      } catch {
        return toPngPlaceholder();
      }
    };

    const finalized = uniqueImages.length === 0 ? [toPngPlaceholder()] : uniqueImages;

    return finalized.map(ensurePng);
  }, [product]);

  const descriptionHtml = useMemo(() => {
    if (!product) {
      return '';
    }

    const fallbackText = `Experience the best in ${product.category} technology with the ${displayName}. This premium product combines cutting-edge features with exceptional build quality to deliver outstanding performance and reliability. Perfect for both professionals and enthusiasts who demand the very best.`;

    let rawDescription = (product.description && product.description.trim().length > 0)
      ? product.description
      : `<p>${fallbackText}</p>`;

    // If description lacks common structural HTML tags, assume it's plain text and preserve newlines
    const hasHtmlStructure = /<\/?(p|br|ul|ol|li|div|h[1-6]|table|blockquote)\b/i.test(rawDescription);
    if (!hasHtmlStructure) {
      rawDescription = rawDescription.replace(/\r\n/g, '<br />').replace(/\n/g, '<br />');
    }

    return sanitizeHtml(rawDescription);
  }, [product, displayName]);

  const pricing = useMemo(() => {
    if (!product) return null;

    const salePrice = typeof product.price === 'number' ? product.price : 0;
    const rawMrp = typeof (product as any).mrp === 'number' ? (product as any).mrp : null;
    const mrp = rawMrp && rawMrp > 0 ? rawMrp : Math.round(salePrice * 1.2 * 100) / 100;
    const hasDiscount = mrp > salePrice;
    const savingsAmount = hasDiscount ? mrp - salePrice : 0;
    const percentageOff = hasDiscount && mrp !== 0
      ? Math.round(((mrp - salePrice) / mrp) * 100)
      : 0;

    return {
      salePrice,
      mrp,
      hasDiscount,
      savingsAmount,
      percentageOff,
    };
  }, [product]);

  const highlightSpecs = useMemo(() => {
    return product?.specifications ? Object.entries(product.specifications as Record<string, string>)
    .filter(([k]) => !['sourceurl', 'source_url', 'source-url', 'seo_title', 'seo_description'].includes(k.toLowerCase()))
    .slice(0, 8) : [];
  }, [product]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (initialProduct) {
      return;
    }
    const fetchProduct = async () => {
      if (isMountedRef.current) {
        setLoading(true);
      }
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (!isMountedRef.current) {
        return;
      }

      if (error) {
        logger.error('Error fetching product:', { error });
      } else if (!isPubliclyVisibleProduct(data)) {
        logger.warn('Hidden public product fetch rejected:', { productId });
        setProduct(null);
      } else {
        logger.info('Fetched product data:', {
          id: data.id,
          image: data.image,
          additional_images: data.additional_images,
          additional_images_type: typeof data.additional_images,
          images: data.images,
          hasAdditionalImages: Array.isArray(data.additional_images),
          additionalImagesLength: Array.isArray(data.additional_images) ? data.additional_images.length : 'not array'
        });

        if (data.additional_images && typeof data.additional_images === 'string') {
          try {
            data.additional_images = JSON.parse(data.additional_images);
            logger.info('Parsed additional_images from string:', data.additional_images as any);
          } catch (e) {
            logger.warn('Failed to parse additional_images string:', { error: e });
          }
        }

        const resolvedTitle = [data.title, data.name]
          .map((value) => (typeof value === 'string' ? value.trim() : ''))
          .find((value) => value.length > 0) || 'Product';

        const rawHsn =
          (data as any).hsnCode ??
          (data as any).hsn_code ??
          (data as any).hsn ??
          (data as any).hsn_sac ??
          null;
        const rawGst =
          (data as any).gstRate ??
          (data as any).gst_rate ??
          (data as any).gst_percentage ??
          null;

        let resolvedGst: number | undefined;
        if (typeof rawGst === 'number' && Number.isFinite(rawGst)) {
          resolvedGst = rawGst;
        } else if (typeof rawGst === 'string') {
          const parsed = Number.parseFloat(rawGst);
          resolvedGst = Number.isFinite(parsed) ? parsed : undefined;
        }

        const resolvedHsn = typeof rawHsn === 'string' && rawHsn.trim().length > 0
          ? rawHsn.trim()
          : undefined;

        const gstRate = resolvedGst ?? 18;
        const rawPrice = typeof data.price === 'number' ? data.price : Number(data.price) || 0;
        const rawMrp = typeof data.mrp === 'number' ? data.mrp : Number(data.mrp) || (rawPrice * 1.2);
        
        const priceNum = rawPrice;
        const mrpNum = rawMrp;

        setProduct({
          ...data,
          title: resolvedTitle,
          name: resolvedTitle,
          price: priceNum,
          mrp: mrpNum,
          hsnCode: resolvedHsn,
          gstRate: gstRate,
        });
      }
      setLoading(false);
    };

    fetchProduct();
  }, [productId, supabase, initialProduct]);

  const handleShare = async () => {
    if (!product) return;
    const url = window.location.href;
    trackEvent('product_share', { productId: product.id, productName: displayName });

    try {
      if (navigator.share) {
        await navigator.share({
          title: displayName,
          text: `Check out ${displayName} on TecBunny`,
          url,
        });
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        toast({
          title: 'Link copied',
          description: 'Product link copied to clipboard.',
        });
        return;
      }

      toast({
        title: 'Share this link',
        description: url,
      });
    } catch (error) {
      logger.error('product_share_failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      toast({
        variant: 'destructive',
        title: 'Share failed',
        description: 'Please try again or copy the URL manually.',
      });
    }
  };

  if (loading) {
    return (
      <div className="tech-main-content bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-6 w-40 rounded bg-white/10 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-[420px] rounded-2xl bg-white/5"></div>
              <div className="space-y-4">
                <div className="h-8 rounded bg-white/10 w-3/4"></div>
                <div className="h-4 rounded bg-white/10 w-1/2"></div>
                <div className="h-12 rounded bg-white/10 w-2/3"></div>
                <div className="h-32 rounded bg-white/5"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="relative overflow-hidden bg-[#09090B] text-zinc-200 selection:bg-blue-500/20 selection:text-white min-h-screen font-sans antialiased">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-white mb-4">Product Not Found</h2>
            <p className="text-muted-foreground mb-8">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Button type="button" onClick={() => router.push('/products')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-background text-foreground selection:bg-primary/20 selection:text-white min-h-screen font-sans antialiased">
      {/* Background Noise and Grid (homepage style) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
        <div className="absolute -left-40 top-0 h-[42rem] w-[42rem] rounded-full bg-primary/5 blur-[160px]" />
        <div className="absolute -right-40 top-1/3 h-[46rem] w-[46rem] rounded-full bg-muted/5 blur-[180px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(var(--background),0.6),_rgba(var(--background),0.95))]" />
      </div>
      
      {/* Ambient Blobs */}
      <div className="ambient-blob pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-primary/10 blur-[120px] animate-pulse" aria-hidden="true" />
      <div className="ambient-blob ambient-blob--delayed pointer-events-none absolute right-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" aria-hidden="true" />

      <div className="relative">
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8 relative z-10">
          <nav className="flex flex-wrap items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground/80">
            <button
              type="button"
              onClick={() => router.push('/products')}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Products
            </button>
            <span>/</span>
            <span className="hover:text-primary transition-colors">{product.category}</span>
            <span>/</span>
            <span className="text-foreground font-semibold">{displayName}</span>
          </nav>

          <section className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
            <div className="space-y-6 lg:col-span-5">
              <div className="relative bg-white border border-border rounded-3xl p-8 h-[550px] flex items-center justify-center overflow-hidden group shadow-2xl">
                <div className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="product-scan-line bg-gradient-to-b from-transparent via-primary/30 to-transparent"></div>
                </div>

                <Image
                  src={productImages[selectedImage]}
                  alt={displayName}
                  width={900}
                  height={900}
                  priority={true}
                  quality={85}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="max-w-full max-h-full object-contain relative z-0 transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://placehold.co/600x600/0f172a/94a3b8.png?text=${encodeURIComponent(displayName)}`;
                    target.srcset = "";
                  }}
                />

                <div className="absolute top-4 left-4 z-20">
                  {product.stock_status === 'out_of_stock' ? (
                    <span className="bg-background text-muted-foreground border border-border text-[10px] font-semibold tracking-wider px-3 py-1.5 rounded-full shadow-lg">
                      OUT OF STOCK
                    </span>
                  ) : product.stock_status === 'low_stock' ? (
                    <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-semibold tracking-wider px-3 py-1.5 rounded-full shadow-lg">
                      LOW STOCK
                    </span>
                  ) : product.stock_status === 'backorder' ? (
                    <span className="bg-muted text-muted-foreground border border-border text-[10px] font-semibold tracking-wider px-3 py-1.5 rounded-full shadow-lg">
                      BACKORDER
                    </span>
                  ) : (
                    <span className="bg-primary/15 text-primary border border-primary/30 text-[10px] font-semibold tracking-wider px-3 py-1.5 rounded-full shadow-lg shadow-primary/5">
                      IN STOCK
                    </span>
                  )}
                </div>
              </div>

              {productImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white border p-2 flex-shrink-0 transition-all duration-300 ${
                      selectedImage === index 
                        ? 'border-primary bg-white shadow-[0_0_15px_rgba(59,130,246,0.2)] scale-105' 
                         : 'border-border hover:border-border/80 hover:scale-102'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${displayName} view ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-contain rounded-lg opacity-80 hover:opacity-100 transition-opacity"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://placehold.co/150x150/0f172a/94a3b8.png?text=View+${index + 1}`;
                        target.srcset = "";
                      }}
                    />
                  </button>
                ))}
              </div>
              )}
            </div>

            <div className="flex flex-col lg:col-span-7">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground font-tech leading-tight mb-3">
                {displayName}
              </h1>

              <div className="flex flex-wrap items-center gap-6 mb-6 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                {product.model_number && (
                  <span>Model: <span className="text-foreground/90">{product.model_number}</span></span>
                )}
                {skuValue && (
                  <span>SKU: <span className="text-foreground/90">{skuValue}</span></span>
                )}
                {Number(product.reviewCount) > 0 && Number(product.rating) > 0 && (
                  <div className="flex items-center gap-2">
                    <StarRating rating={product.rating} size="sm" />
                    <span className="text-[10px]">({product.reviewCount} {Number(product.reviewCount) === 1 ? 'review' : 'reviews'})</span>
                  </div>
                )}
              </div>

              <div className="bg-card/45 border border-border/80 rounded-2xl p-8 mb-8 backdrop-blur-md shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                {pricing && (
                  <div className="flex flex-wrap items-baseline gap-4 mb-3 relative z-10">
                    <span className="text-3xl sm:text-4xl font-bold text-foreground font-tech tracking-tight">₹{pricing.salePrice.toLocaleString('en-IN')}</span>
                    {pricing.hasDiscount && (
                      <>
                        <span className="text-xl text-muted-foreground line-through font-light">₹{pricing.mrp.toLocaleString('en-IN')}</span>
                        {pricing.percentageOff > 0 && (
                          <span className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full uppercase tracking-wider">
                            {pricing.percentageOff}% OFF
                          </span>
                        )}
                      </>
                    )}
                  </div>
                )}
                <p className="text-xs text-muted-foreground/60 font-mono relative z-10">PRICE INCLUSIVE OF GST. INSTALLATION & CABLING CHARGED ON ACTUALS.</p>
              </div>

              <div className="mb-8">
                {highlightSpecs.length > 0 && (
                  <div className="bg-card/30 border border-border/50 rounded-xl p-5 mb-8">
                    <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                      <span className="w-1 h-4 bg-primary rounded-full"></span>
                      Key Specifications
                    </h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 list-none pl-0 m-0">
                      {highlightSpecs.map(([key, value]) => (
                        <li key={key} className="flex items-start gap-2 text-sm">
                          <span className="text-muted-foreground/80 font-mono uppercase text-[11px] w-[100px] shrink-0 pt-0.5">{key}</span>
                          <span className="text-foreground/90 font-medium break-words leading-tight">{value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="prose prose-invert prose-sm sm:prose-base max-w-none text-muted-foreground leading-relaxed prose-headings:text-foreground prose-headings:mt-6 prose-headings:mb-3 prose-strong:text-foreground prose-ul:list-disc prose-ul:pl-5 prose-li:my-2 prose-p:my-3">
                  <div dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
                </div>
              </div>

              <div className="mt-auto space-y-4">
                <div className="flex flex-wrap gap-4">
                  <AddToCartButton
                    product={product}
                    className="flex-1 min-w-[220px] h-14 text-base bg-primary hover:bg-primary/90 text-primary-foreground font-bold tracking-wide uppercase rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-[0_0_30px_-5px_rgba(var(--primary),0.45)] border border-primary/20 cursor-pointer"
                    size="lg"
                  />
                  <WishlistButton
                    product={product}
                    className="h-14 w-14 flex-shrink-0 border border-border bg-muted/30 hover:bg-muted/60 hover:border-border/80 text-foreground rounded-xl transition-all duration-300 cursor-pointer"
                  />
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-14 w-14 flex-shrink-0 border border-border bg-muted/30 hover:bg-muted/60 hover:border-border/80 text-foreground rounded-xl transition-all duration-300 cursor-pointer"
                    onClick={handleShare}
                    aria-label={`Share ${displayName}`}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-4">
                  <Button
                    variant="outline"
                    className="flex-1 h-12 border border-border bg-muted/20 hover:bg-muted/40 hover:border-border/80 text-muted-foreground hover:text-foreground rounded-xl transition-all duration-300 cursor-pointer"
                    onClick={() => trackEvent('installation_inquiry', { productId: product.id, productName: displayName })}
                  >
                    <Truck className="mr-2 h-4 w-4 text-primary" />
                    Installation Inquiry
                  </Button>
                  <a
                    href={`https://wa.me/919604136010?text=Hi%20TecBunny,%20I%20would%20like%20to%20request%20a%20corporate%20B2B%20quotation%20for%20the%20following%20hardware%20setup:%0A%0A-%20Product:%20${encodeURIComponent(displayName)}%0A-%20SKU:%20${encodeURIComponent((product as any).sku || product.barcode || product.id)}%0A%0AMy%20Company%20Details:%0A-%20Company%20Name:%20%0A-%20GSTIN:%20%0A-%20Deployment%20Location:%20%0A-%20Requirements:%20`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 h-12 border border-emerald-500/35 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/50 text-emerald-450 hover:text-emerald-400 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-wider cursor-pointer"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-emerald-500 fill-emerald-500 shrink-0">
                      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2m.01 1.67c4.56 0 8.25 3.69 8.25 8.25 0 4.56-3.69 8.25-8.25 8.25-1.53 0-3-.42-4.29-1.19l-.3-.18-3.18.83.85-3.11-.2-.32a8.182 8.182 0 0 1-1.25-4.38c0-4.56 3.69-8.25 8.25-8.25M9.42 7.72l-.12.02c-.15.03-.3.06-.44.09-.15.03-.28.06-.41.1-.39.12-.76.3-1.09.56-.33.27-.63.6-.88.97-.27.41-.43.85-.43 1.32 0 .5.16.98.48 1.41.32.43.72.84 1.2 1.24.48.4 1 1.03 1.63 1.28.63.25 1.22.4 1.84.4.45 0 .86-.08 1.23-.25.37-.17.63-.38.83-.63.2-.25.32-.54.4-.85.08-.31.13-.64.13-1s-.05-.72-.13-1.03c-.08-.31-.2-.59-.4-.84-.2-.25-.46-.46-.83-.63-.37-.17-.78-.25-1.23-.25-.62 0-1.21.15-1.84.4-.05.02-.1.04-.15.07-.1.03-.18.07-.27.1-.1.03-.18.05-.28.07l-.17.04c-.06.01-.1.02-.12.02-.02 0-.04.01-.06.01-.02 0-.03 0-.03-.01s0-.01 0-.01l-.01-.01c0-.01.01-.02.01-.04 0-.02 0-.04.01-.06.01-.02.01-.04.02-.06a.7.7 0 0 1 .05-.12c.04-.08.08-.15.14-.23.06-.08.12-.15.2-.22.07-.07.15-.14.23-.2.08-.06.16-.12.25-.17.09-.05.18-.09.28-.13.05-.02.1-.04.13-.05.28-.11.53-.17.75-.17.22 0 .43.03.62.09.19.06.37.14.53.25.16.11.3.25.41.41s.19.34.24.54c.05.2.07.4.07.61 0 .02 0 .03 0 .03s0 .02 0 .02l-.01.03c0 .01-.01.02-.01.03 0 .01-.01.02-.02.03-.01.01-.02.02-.04.03l-.05.03-.06.03c-.02.01-.05.02-.08.03-.03.01-.06.02-.1.04-.04.01-.07.02-.11.04-.04.01-.07.03-.11.04-.04.02-.07.03-.1.05s-.07.04-.1.06-.06.04-.1.07c-.03.02-.06.04-.1.07l-.07.05c-.01 0-.01.01-.01.01s0 .01 0 .01l.01.01c.22-.12.44-.24.67-.35.23-.11.45-.24.67-.35.22-.11.44-.22.65-.33.21-.11.42-.22.62-.33l.2-.1c.14-.07.26-.15.39-.22.13-.07.25-.15.36-.24.11-.09.22-.18.31-.29s.18-.23.25-.36a2.64 2.64 0 0 0 .28-1.38c0-.52-.13-1-.39-1.44a3.17 3.17 0 0 0-1.08-1.21c-.4-.33-.86-.57-1.36-.72s-1.02-.22-1.56-.22c-.54 0-1.06.07-1.56.22s-.96.39-1.36.72c-.4.34-.72.75-.97 1.21-.25.46-.38.96-.38 1.51 0 .42.09.82.26 1.17.17.35.4.66.68.92.28.26.59.47.92.62.33.15.68.25 1.04.28h.1c.02 0 .03 0 .03-.01s0-.01 0-.01l-.01-.01c0-.01 0-.01.01-.02l.01-.02c0-.01.01-.02.01-.03l.01-.03c.01-.02.01-.03.01-.05 0-.02 0-.04.01-.06 0-.02.01-.04.01-.06a.71.71 0 0 0 0-.1c0-.04 0-.08-.02-.13s-.04-.1-.07-.15a.43.43 0 0 0-.1-.13c-.04-.04-.08-.08-.13-.11-.05-.03-.1-.06-.17-.08-.07-.02-.13-.04-.2-.06-.07-.02-.15-.03-.22-.04-.04-.01-.07-.01-.11-.02l-.11-.02h-.04z" />
                    </svg>
                    Request B2B Quote
                  </a>
                </div>

                <div className="border border-border/40 bg-muted/5 rounded-2xl p-4 mt-2">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Truck className="h-4.5 w-4.5 text-primary shrink-0" />
                      <div>
                        {deliveryInfo.isGoa ? (
                          <p className="font-semibold text-emerald-400">
                            In Stock at Parse Hub &mdash; Next-Day Delivery
                          </p>
                        ) : (
                          <p className="font-semibold text-zinc-400">
                            Sourced from Mumbai/Bangalore Hub &mdash; Ships in 4&ndash;5 Days
                          </p>
                        )}
                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                          {deliveryInfo.hasEstimated 
                            ? `Estimated for PIN ${pincode}` 
                            : 'Estimated for Goa Region'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPincodeInput(!showPincodeInput)}
                      className="text-[10px] font-bold uppercase tracking-wider text-primary hover:underline cursor-pointer shrink-0"
                    >
                      {showPincodeInput ? 'Cancel' : 'Change PIN'}
                    </button>
                  </div>

                  {showPincodeInput && (
                    <form onSubmit={handlePincodeSubmit} className="mt-3 flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="Enter 6-digit PIN code"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                        className="flex-1 h-9 rounded-lg bg-zinc-950 border border-border/80 px-3 text-xs text-foreground placeholder:text-zinc-650 focus:outline-none focus:border-primary"
                      />
                      <button
                        type="submit"
                        className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors"
                      >
                        Apply
                      </button>
                    </form>
                  )}
                </div>

                <p className="text-xs text-center text-muted-foreground/60">
                  <Shield className="inline-block h-3.5 w-3.5 mr-1 text-primary" />
                  {((product.specifications as Record<string, string>)?.warrantyPeriod || (product as any).warranty) 
                    ? `${((product.specifications as Record<string, string>)?.warrantyPeriod || (product as any).warranty)} included.` 
                    : 'Standard Manufacturer Warranty included.'}
                </p>
              </div>
            </div>
          </section>

          <section className="mt-16 border border-border/80 bg-muted/10 rounded-3xl backdrop-blur-sm">
            <div className="px-6 py-10 sm:px-8">
              <div className="flex gap-8 border-b border-border/80 mb-8 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => setActiveTab('specs')}
                  className={`px-4 py-3 text-sm font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-all duration-300 cursor-pointer ${
                    activeTab === 'specs'
                      ? 'border-primary text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.3)]'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Specifications
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('description')}
                  className={`px-4 py-3 text-sm font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-all duration-300 cursor-pointer ${
                    activeTab === 'description'
                      ? 'border-primary text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.3)]'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Description
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('warranty')}
                  className={`px-4 py-3 text-sm font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-all duration-300 cursor-pointer ${
                    activeTab === 'warranty'
                      ? 'border-primary text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.3)]'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Warranty Info
                </button>
              </div>

              {activeTab === 'specs' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-4 text-sm font-mono">
                  {product.specifications && Object.keys(product.specifications).length > 0 ? (
                    (() => {
                      const filteredSpecs = Object.entries(product.specifications)
                        .filter(([key]) => !['sourceurl', 'source_url', 'source-url'].includes(key.toLowerCase()));
                      if (filteredSpecs.length === 0) {
                        return <div className="text-muted-foreground/80 italic">Specifications will be updated soon.</div>;
                      }
                      return filteredSpecs.map(([key, value]) => (
                        <div key={key} className="flex justify-between py-4 border-b border-border/60">
                          <span className="text-muted-foreground/80 uppercase text-xs">{key}</span>
                          <span className="text-foreground/90 text-right font-medium">{value}</span>
                        </div>
                      ));
                    })()
                  ) : (
                    <div className="text-muted-foreground/80 italic">Specifications will be updated soon.</div>
                  )}
                </div>
              )}

              {activeTab === 'description' && (
                <div className="prose prose-invert prose-sm sm:prose-base max-w-none text-muted-foreground leading-relaxed prose-headings:text-foreground prose-strong:text-foreground prose-ul:list-disc prose-ul:pl-5 prose-li:my-1 prose-p:my-3">
                  <div dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
                </div>
              )}

              {activeTab === 'warranty' && (
                <div className="rounded-2xl border border-border bg-muted/10 p-6 text-sm text-muted-foreground space-y-4 max-w-2xl backdrop-blur-sm">
                  <p className="leading-relaxed">
                    {((product.specifications as Record<string, string>)?.warrantyPeriod || (product as any).warranty)
                      ? `${((product.specifications as Record<string, string>)?.warrantyPeriod || (product as any).warranty)} coverage provided by manufacturer.`
                      : 'Standard Manufacturer Warranty included with purchase.'}
                  </p>
                  <div className="flex items-center gap-3 text-muted-foreground/80">
                    <RefreshCw className="h-4 w-4 text-primary animate-spin-slow" />
                    <span>Hassle-free replacement for eligible defects.</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground/80">
                    <Shield className="h-4 w-4 text-primary" />
                    <span>Support available via Tecbunny SLA desk.</span>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* 2. BEHAVIORAL CRO ASSISTANCE BANNER */}
      {showAssistance && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in slide-in-from-bottom-10 fade-in duration-500">
          <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-muted/95 p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <RefreshCw className="h-5 w-5 animate-spin-slow" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-white">Need a custom surveillance blueprint?</h4>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {triggerContext === 'pricing' 
                    ? "Our experts can help optimize this configuration for your specific space and budget requirements."
                    : "Architecture can be complex. Let's schedule a 10-minute discovery call to finalize your setup."}
                </p>
                <div className="mt-4 flex gap-3">
                  <Button 
                    size="sm" 
                    className="h-8 bg-primary hover:bg-primary/90 text-white text-[10px]"
                    onClick={() => router.push('/contact?ref=behavioral_assistance')}
                  >
                    Speak to Specialist
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-[10px] text-muted-foreground hover:text-muted-foreground"
                    onClick={dismissAssistance}
                  >
                    Maybe later
                  </Button>
                </div>
              </div>
            </div>
            {/* Ambient Background Glow */}
            <div className="absolute -bottom-10 -left-10 h-32 w-32 bg-primary/5 blur-[80px]" />
          </div>
        </div>
      )}
    </div>
  );
}
