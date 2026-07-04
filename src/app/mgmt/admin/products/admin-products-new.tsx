'use client';

import * as React from 'react';
import { Pencil, Plus, Trash2, MoreHorizontal, Loader2, Upload, Download } from 'lucide-react';
import { useToast } from '../../../../hooks/use-toast';
import { logger } from '@/lib/logger';
import type { Product } from '@/lib/types';
import { getProductDisplayImage } from '@/lib/image-utils';
import { usePathname } from 'next/navigation';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { CreateProductDialog } from '@/components/admin/CreateProductDialog';
import { EditProductDialog } from '@/components/admin/EditProductDialog';

export default function AdminProductsPage() {
  const pathname = usePathname();
  const isSuperadmin = pathname?.startsWith('/superadmin');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  
  const filteredProducts = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return products;
    return products.filter(p => {
      const name = (p.title || p.name || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();
      const brand = (p.brand || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
      return name.includes(q) || cat.includes(q) || brand.includes(q) || desc.includes(q);
    });
  }, [products, searchQuery]);

  const [importing, setImporting] = React.useState(false);
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [scrapeDialogOpen, setScrapeDialogOpen] = React.useState(false);
  const [scrapeUrl, setScrapeUrl] = React.useState('');
  const [scraping, setScraping] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [editedPrices, setEditedPrices] = React.useState<Record<string, { mrp: number; price: number }>>({});
  const [savingProductId, setSavingProductId] = React.useState<string | null>(null);

  // Bulk Edit State
  const [selectedProductIds, setSelectedProductIds] = React.useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = React.useState<string | null>(null); // 'delete', 'activate', 'deactivate'

  const { toast } = useToast();

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProductIds(new Set(filteredProducts.map(p => p.id)));
    } else {
      setSelectedProductIds(new Set());
    }
  };

  const handleSelectProduct = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedProductIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedProductIds(newSelected);
  };

  const handleBulkAction = async (action: 'delete' | 'activate' | 'deactivate') => {
    if (selectedProductIds.size === 0) return;
    
    // Add confirmation for delete
    if (action === 'delete') {
      const confirmed = window.confirm(`Are you sure you want to permanently delete ${selectedProductIds.size} products?`);
      if (!confirmed) return;
    }

    setBulkActionLoading(action);
    try {
      const response = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedProductIds), action })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Bulk action failed');
      
      toast({
        title: 'Success',
        description: `Successfully applied '${action}' to ${selectedProductIds.size} products.`,
      });
      
      setSelectedProductIds(new Set());
      fetchProducts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Bulk action failed',
        variant: 'destructive',
      });
    } finally {
      setBulkActionLoading(null);
    }
  };

  const handleScrapeUrl = async () => {
    if (!scrapeUrl.trim()) return;
    setScraping(true);
    try {
      const response = await fetch('/api/products/scrape-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: scrapeUrl.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to scrape URL');
      toast({ title: 'Success', description: 'Product imported successfully via AI' });
      setScrapeDialogOpen(false);
      setScrapeUrl('');
      fetchProducts();
    } catch (error: any) {
      toast({ title: 'Scraping Failed', description: error.message, variant: 'destructive' });
    } finally {
      setScraping(false);
    }
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/products/simple-import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to import CSV');
      }

      toast({
        title: data.details?.errorCount > 0 ? 'Import completed with errors' : 'Success',
        description: data.details?.errorCount > 0 
          ? `${data.message}\nErrors:\n${data.details.errors.slice(0, 5).join('\n')}`
          : (data.message || 'CSV imported successfully'),
        variant: data.details?.errorCount > 0 ? 'destructive' : 'default',
      });
      fetchProducts();
    } catch (error: any) {
      logger.error('Failed to import CSV', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to import CSV',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const exportToCSV = () => {
    if (products.length === 0) {
      toast({
        title: 'Info',
        description: 'No products to export',
      });
      return;
    }

    const headers = [
      'Handle ID',
      'Type',
      'Title',
      'Brand',
      'Description',
      'Product Detail',
      'Image Link',
      'Warranty Details',
      'Stock Status',
      'Status'
    ];

    const rows = products.map((p: any) => [
      p.handle_id || p.id || '',
      p.entry_type || 'product',
      p.title || p.name || '',
      p.brand || '',
      p.description || '',
      p.product_detail || '',
      p.image_url || p.image || '',
      p.warranty_details || '',
      p.in_stock !== false ? 'In Stock' : 'Out of Stock',
      p.status || 'active'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row
          .map((val) => {
            const clean = String(val).replace(/"/g, '""');
            return `"${clean}"`;
          })
          .join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'products_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadSampleCSV = () => {
    const headers = [
      'Handle ID',
      'Type',
      'Title',
      'Brand',
      'Description',
      'Product Detail',
      'Image Link',
      'Warranty Details',
      'Stock Status',
      'Status'
    ];

    const sampleRows = [
      [
        'TB-CCTV-001',
        'Product',
        'Hikvision 4MP IP Camera',
        'Hikvision',
        'High definition security camera with night vision',
        '4MP resolution; POE; Outdoor rated',
        'https://images.unsplash.com/photo-1557597774-9d273605dfa9',
        '2 Years Warranty',
        'In Stock',
        'Active'
      ],
      [
        'TB-CCTV-001',
        'Variant',
        'Hikvision 4MP IP Camera - Dome',
        'Hikvision',
        'Dome shape variant',
        'Ceiling mount; indoor use',
        'https://images.unsplash.com/photo-1557597774-9d273605dfa9',
        '2 Years Warranty',
        'In Stock',
        'Active'
      ]
    ];

    const csvContent = [
      headers.join(','),
      ...sampleRows.map((row) =>
        row
          .map((val) => {
            const clean = String(val).replace(/"/g, '""');
            return `"${clean}"`;
          })
          .join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'products_sample.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchProducts = React.useCallback(async () => {
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 15000);

      const response = await fetch('/api/admin/products', {
        cache: 'no-store',
        signal: controller.signal,
      });
      const payload = await response.json().catch(() => null);
      window.clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(payload?.error || `Failed to fetch products (${response.status})`);
      }

      const rows = Array.isArray(payload?.products) ? payload.products : [];
      setProducts(rows as Product[]);
    } catch (error) {
      logger.error('Failed to fetch products', { error });
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch products',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    try {
      const response = await fetch(`/api/products?id=${selectedProduct.id}`, {
        method: 'DELETE',
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to delete product');
      }

      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });
      fetchProducts();
    } catch (error) {
      logger.error('Failed to delete product', { error });
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
    }
  };

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const handlePriceChange = (productId: string, field: 'mrp' | 'price', value: number) => {
    setEditedPrices(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }));
  };

  const handleDiscardPrices = (productId: string) => {
    setEditedPrices(prev => {
      const newState = { ...prev };
      delete newState[productId];
      return newState;
    });
  };

  const handleSavePrices = async (productId: string) => {
    const edited = editedPrices[productId];
    if (!edited) return;

    if (edited.price < 0 || edited.mrp < 0) {
      toast({
        title: 'Validation Error',
        description: 'Pricing amounts cannot be negative.',
        variant: 'destructive',
      });
      return;
    }
    if (edited.price > edited.mrp) {
      toast({
        title: 'Validation Error',
        description: 'Sale price cannot exceed the Maximum Retail Price (MRP).',
        variant: 'destructive',
      });
      return;
    }

    setSavingProductId(productId);
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mrp: edited.mrp, price: edited.price }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || 'Update failed');
      }
      toast({ title: 'Success', description: 'Prices updated successfully.', duration: 2000 });
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, mrp: edited.mrp, price: edited.price } : p));
      setEditedPrices(prev => {
        const newState = { ...prev };
        delete newState[productId];
        return newState;
      });
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Update failed', variant: 'destructive' });
    } finally {
      setSavingProductId(null);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-7xl space-y-6">
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        onChange={handleCSVImport}
        className="hidden"
      />

      {/* Header and Toolbar actions: wraps on mobile and stack columns */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center border-b border-border/40 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground text-sm">
            Manage your product inventory, pricing, and details.
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full sm:w-auto sm:flex-row sm:items-center">
          {isSuperadmin && (
            <>
              {/* CSV Operations Dropdown for Mobile (prevents button squishing & text overflow) */}
              <div className="block sm:hidden w-full">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full h-11 justify-between text-sm font-medium border-border/60">
                      <span className="flex items-center gap-2">
                        {importing ? (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : (
                          <Upload className="h-4 w-4 text-muted-foreground" />
                        )}
                        {importing ? 'Importing CSV...' : 'CSV Operations'}
                      </span>
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[calc(100vw-32px)]">
                    <DropdownMenuLabel>Data Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={downloadSampleCSV} className="h-11 cursor-pointer">
                      <Download className="mr-2 h-4 w-4 text-muted-foreground" />
                      Download Sample CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => fileInputRef.current?.click()} 
                      disabled={importing}
                      className="h-11 cursor-pointer"
                    >
                      <Upload className="mr-2 h-4 w-4 text-muted-foreground" />
                      Import CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={exportToCSV} 
                      disabled={products.length === 0}
                      className="h-11 cursor-pointer"
                    >
                      <Download className="mr-2 h-4 w-4 text-muted-foreground" />
                      Export CSV
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Desktop CSV Actions */}
              <div className="hidden sm:flex sm:items-center gap-2">
                <Button
                  variant="outline"
                  onClick={downloadSampleCSV}
                  className="h-9 text-sm flex items-center justify-center"
                >
                  <Download className="mr-1.5 h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">Sample</span>
                </Button>
                <Button
                  variant="outline"
                  disabled={importing}
                  onClick={() => fileInputRef.current?.click()}
                  className="h-9 text-sm flex items-center justify-center"
                >
                  {importing ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin flex-shrink-0" />
                  ) : (
                    <Upload className="mr-1.5 h-3.5 w-3.5 flex-shrink-0" />
                  )}
                  <span className="truncate">Import</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={exportToCSV}
                  disabled={products.length === 0}
                  className="h-9 text-sm flex items-center justify-center"
                >
                  <Download className="mr-1.5 h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">Export</span>
                </Button>
              </div>
            </>
          )}
          <Button 
            onClick={() => setScrapeDialogOpen(true)}
            variant="outline"
            className="w-full sm:w-auto h-11 sm:h-9 text-sm flex items-center justify-center border-primary text-primary hover:bg-primary/10"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            URL Scrape
          </Button>
          <Button 
            onClick={() => setCreateDialogOpen(true)}
            className="w-full sm:w-auto h-11 sm:h-9 text-sm font-semibold flex items-center justify-center bg-primary text-white hover:bg-primary/95"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedProductIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-background border border-border/80 shadow-lg rounded-full px-6 py-3 flex items-center gap-2 sm:gap-4 animate-in slide-in-from-bottom-5 w-[95%] sm:w-auto overflow-x-auto">
          <span className="text-sm font-medium border-r pr-4 border-border/40 whitespace-nowrap">
            {selectedProductIds.size} selected
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleBulkAction('activate')}
            disabled={!!bulkActionLoading}
            className="text-green-500 hover:text-green-600 hover:bg-green-500/10 whitespace-nowrap"
          >
            {bulkActionLoading === 'activate' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Set Active
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleBulkAction('deactivate')}
            disabled={!!bulkActionLoading}
            className="text-orange-500 hover:text-orange-600 hover:bg-orange-500/10 whitespace-nowrap"
          >
            {bulkActionLoading === 'deactivate' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Set Inactive
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleBulkAction('delete')}
            disabled={!!bulkActionLoading}
            className="text-red-500 hover:text-red-600 hover:bg-red-500/10 whitespace-nowrap"
          >
            {bulkActionLoading === 'delete' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 sm:mr-2" />}
            <span className="hidden sm:inline">Delete</span>
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setSelectedProductIds(new Set())}
            className="ml-auto sm:ml-2 h-8 w-8 rounded-full flex-shrink-0"
          >
            ✕
          </Button>
        </div>
      )}

      <Card className="border-border bg-card/40 backdrop-blur-sm shadow-sm overflow-hidden">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle>All Products</CardTitle>
          <CardDescription>
            A list of all products available on the platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          {/* Search bar */}
          {isSuperadmin && !loading && products.length > 0 && (
            <div className="mb-6 relative">
              <input
                type="text"
                placeholder="Search products by title, category, brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 px-4 pr-10 rounded-lg border border-border bg-zinc-950 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 font-mono"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground font-mono cursor-pointer"
                >
                  ✕ Clear
                </button>
              )}
            </div>
          )}
          {loading ? (
            <div className="w-full min-h-[350px]">
              {/* Desktop Skeleton Loader (Hidden on Mobile) */}
              <div className="hidden md:block space-y-4">
                <div className="flex items-center space-x-4 border-b border-border pb-4">
                  <div className="h-4 bg-muted rounded animate-pulse w-1/4" />
                  <div className="h-4 bg-muted rounded animate-pulse w-1/6" />
                  <div className="h-4 bg-muted rounded animate-pulse w-1/12" />
                  <div className="h-4 bg-muted rounded animate-pulse w-1/12" />
                  <div className="h-4 bg-muted rounded animate-pulse w-1/12" />
                  <div className="h-4 bg-muted rounded animate-pulse w-1/12" />
                  <div className="h-4 bg-muted rounded animate-pulse w-1/12 ml-auto" />
                </div>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 py-3 border-b border-border">
                    <div className="flex items-center gap-2 w-1/4">
                      <div className="w-8 h-8 rounded bg-muted animate-pulse" />
                      <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                    </div>
                    <div className="h-6 bg-muted rounded animate-pulse w-1/6" />
                    <div className="h-8 bg-muted rounded animate-pulse w-28" />
                    <div className="h-8 bg-muted rounded animate-pulse w-28" />
                    <div className="h-4 bg-muted rounded animate-pulse w-1/12" />
                    <div className="h-6 bg-muted rounded animate-pulse w-16" />
                    <div className="h-8 bg-muted rounded animate-pulse w-10 ml-auto" />
                  </div>
                ))}
              </div>

              {/* Mobile Skeleton Loader (Hidden on Desktop) */}
              <div className="space-y-4 md:hidden">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-border p-4 space-y-4 bg-card animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/4" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                      <div className="h-11 bg-muted rounded" />
                      <div className="h-11 bg-muted rounded" />
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <div className="h-4 bg-muted rounded w-1/4" />
                      <div className="h-6 bg-muted rounded w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No products found. Click "Add Product" to create one.
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No products match your search query "{searchQuery}".
            </div>
          ) : (
            <>
              {/* Desktop Table View (Hidden on Mobile) */}
              <div className="hidden md:block overflow-x-auto w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox 
                          checked={filteredProducts.length > 0 && selectedProductIds.size === filteredProducts.length}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="w-20 lg:w-28">MRP</TableHead>
                      <TableHead className="w-20 lg:w-28">Sale Price</TableHead>
                      <TableHead className="hidden lg:table-cell w-16">Stock</TableHead>
                      <TableHead className="hidden lg:table-cell w-20">Status</TableHead>
                      <TableHead className="text-right w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedProductIds.has(product.id)}
                            onCheckedChange={(checked) => handleSelectProduct(product.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell className="max-w-[120px] lg:max-w-[200px]">
                          <div className="flex items-center gap-2">
                            {getProductDisplayImage(product) ? (
                              <img src={getProductDisplayImage(product)!} alt={product.title} className="w-8 h-8 rounded object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground flex-shrink-0">
                                No Image
                              </div>
                            )}
                            <span className="truncate block w-full">{product.title || product.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[100px] lg:max-w-[150px]">
                          <Badge variant="outline" className="truncate block w-full text-left" title={product.category}>
                            {product.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 w-20 lg:w-28">
                            <Input
                              type="number"
                              placeholder="MRP"
                              className="h-8 text-sm px-2"
                              value={editedPrices[product.id]?.mrp ?? product.mrp ?? 0}
                              disabled={savingProductId === product.id}
                              onChange={(e) => handlePriceChange(product.id, 'mrp', parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 w-20 lg:w-28">
                            <Input
                              type="number"
                              placeholder="Sale"
                              className="h-8 text-sm px-2"
                              value={editedPrices[product.id]?.price ?? product.price ?? 0}
                              disabled={savingProductId === product.id}
                              onChange={(e) => handlePriceChange(product.id, 'price', parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {product.stock_quantity ?? 'N/A'}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                            {product.status || 'Active'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end items-center">
                            {editedPrices[product.id] && (
                              <div className="flex items-center gap-1.5">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 text-sm text-muted-foreground hover:text-foreground"
                                  onClick={() => handleDiscardPrices(product.id)}
                                  disabled={savingProductId === product.id}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="h-8 text-sm"
                                  onClick={() => handleSavePrices(product.id)}
                                  disabled={savingProductId === product.id}
                                >
                                  {savingProductId === product.id ? (
                                    <>
                                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                      Saving
                                    </>
                                  ) : 'Save'}
                                </Button>
                              </div>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleEditClick(product)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteClick(product)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card Grid View (Hidden on Desktop) */}
              <div className="grid grid-cols-1 gap-4 md:hidden">
                {filteredProducts.map((product) => (
                  <div 
                    key={product.id} 
                    className="rounded-xl border border-border/80 p-4 space-y-4 bg-card/60 text-card-foreground shadow-sm hover:border-border transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="pt-1">
                        <Checkbox 
                          checked={selectedProductIds.has(product.id)}
                          onCheckedChange={(checked) => handleSelectProduct(product.id, checked as boolean)}
                        />
                      </div>
                      {getProductDisplayImage(product) ? (
                        <img src={getProductDisplayImage(product)!} alt={product.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground flex-shrink-0">
                          No Image
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-base text-foreground truncate">{product.title || product.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px]" title={product.category}>{product.category}</p>
                      </div>
                      <div className="flex-shrink-0">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-11 w-11 p-0 rounded-full border border-border/65">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEditClick(product)}>
                              <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDeleteClick(product)} className="text-red-600 focus:text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Pricing Grid with 44px Hardened Touch Targets */}
                     <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/40">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">MRP</span>
                        <Input
                          type="number"
                          placeholder="MRP"
                          className="h-11 text-base bg-muted/10 border border-border"
                          value={editedPrices[product.id]?.mrp ?? product.mrp ?? 0}
                          disabled={savingProductId === product.id}
                          onChange={(e) => handlePriceChange(product.id, 'mrp', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sale Price</span>
                        <Input
                          type="number"
                          placeholder="Sale Price"
                          className="h-11 text-base bg-muted/10 border border-border"
                          value={editedPrices[product.id]?.price ?? product.price ?? 0}
                          disabled={savingProductId === product.id}
                          onChange={(e) => handlePriceChange(product.id, 'price', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>

                    {/* Save / Cancel buttons if edited - Prevents CLS by displaying cleanly in dedicated block */}
                    {editedPrices[product.id] && (
                      <div className="flex gap-2 w-full pt-2 border-t border-border/40">
                        <Button
                          variant="outline"
                          className="flex-1 h-11 text-sm"
                          onClick={() => handleDiscardPrices(product.id)}
                          disabled={savingProductId === product.id}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="flex-1 h-11 text-sm bg-primary text-white hover:bg-primary/95"
                          onClick={() => handleSavePrices(product.id)}
                          disabled={savingProductId === product.id}
                        >
                          {savingProductId === product.id ? (
                            <span className="flex items-center gap-1 justify-center">
                              <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                            </span>
                          ) : 'Save'}
                        </Button>
                      </div>
                    )}

                    {/* Stock status footer */}
                    <div className="flex justify-between items-center pt-2 border-t border-border/40 text-sm">
                      <div className="text-muted-foreground">
                        Stock: <span className="font-semibold text-foreground">{product.stock_quantity ?? 'N/A'}</span>
                      </div>
                      <div>
                        <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                          {product.status || 'Active'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <CreateProductDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen}
        onProductCreated={fetchProducts}
      />

      {selectedProduct && (
        <EditProductDialog 
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            product={selectedProduct}
            onProductUpdated={fetchProducts}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              "{selectedProduct?.title || selectedProduct?.name}" and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-11 sm:h-9">Cancel</AlertDialogCancel>
            <AlertDialogAction 
                onClick={handleDeleteProduct}
                className="h-11 sm:h-9 bg-red-600 focus:ring-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Scrape from URL Dialog */}
      <AlertDialog open={scrapeDialogOpen} onOpenChange={setScrapeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Scrape Product via URL</AlertDialogTitle>
            <AlertDialogDescription>
              Enter a public URL (e.g. Amazon, Flipkart) to extract product details using AI. Note: Some sites might block server-side requests.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input 
              value={scrapeUrl}
              onChange={(e) => setScrapeUrl(e.target.value)}
              placeholder="https://www.amazon.in/dp/B0..."
              disabled={scraping}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={scraping}>Cancel</AlertDialogCancel>
            <Button onClick={handleScrapeUrl} disabled={!scrapeUrl || scraping}>
              {scraping ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {scraping ? 'Scraping with AI...' : 'Extract & Import'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
