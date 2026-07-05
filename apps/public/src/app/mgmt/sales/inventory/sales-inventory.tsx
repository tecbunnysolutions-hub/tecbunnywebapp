
'use client';

import * as React from 'react';

import Image from 'next/image';

import { Plus, Minus, Package, AlertTriangle } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/lib/types';
import { ViewSerialsDialog } from '@/components/sales/ViewSerialsDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '../../../../hooks/use-toast';
import { logger } from '@/lib/logger';

interface ProductWithStock extends Product {
    stock_quantity: number;
    stock_label: string;
    warehouse_location?: string;
    minimum_stock?: number;
    available_serials?: number;
    last_updated?: string;
}

export default function InventoryManagementPage() {
    const [productList, setProductList] = React.useState<ProductWithStock[]>([]);
    const [selectedProduct, setSelectedProduct] = React.useState<ProductWithStock | null>(null);
    const [editingStock, setEditingStock] = React.useState<string | null>(null);
    const [newStockValue, setNewStockValue] = React.useState<number>(0);
    const [loading, setLoading] = React.useState(true);
    const { toast } = useToast();

    const fetchInventory = React.useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/inventory');
            const data = await response.json();

            if (!response.ok) {
                logger.error('Failed to fetch inventory from API', { data });
                toast({
                    title: "Error",
                    description: data.error || "Failed to fetch inventory data",
                    variant: "destructive",
                });
                setProductList([]);
                return;
            }

            const normalizedInventory = (data.inventory || []).map((item: any) => ({
                ...item,
                name: item?.name || item?.product_name || 'Unnamed Product',
                stock_quantity: Number(item?.stock_quantity ?? 0),
                category: item?.category || 'Uncategorized',
            }));
            setProductList(normalizedInventory as ProductWithStock[]);
        } catch (error) {
            logger.error("Unexpected error in sales-inventory fetch", { error });
            toast({
                title: "Error",
                description: "An unexpected error occurred",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    React.useEffect(() => {
        fetchInventory();
    }, [fetchInventory]);

    const updateStock = async (productId: string, newStock: number) => {
        try {
            // Use the inventory API for consistent stock updates
            const response = await fetch('/api/inventory', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    product_id: productId,
                    new_quantity: newStock
                })
            });

            const result = await response.json();

            if (!response.ok) {
                logger.error('API Error in sales-inventory stock update', { result });
                toast({
                    title: "Update Failed",
                    description: result.error || "Failed to update stock quantity.",
                    variant: "destructive",
                });
                return;
            }

            // Success notification
            toast({
                title: "Stock Updated",
                description: `Stock quantity updated to ${newStock}`,
            });

            // Refresh inventory data
            await fetchInventory();
            toast({
                title: "Stock Updated",
                description: "Stock quantity has been updated successfully.",
            });
        } catch (error) {
            logger.error('Error updating stock in sales-inventory', { error });
            toast({
                title: "Update Failed",
                description: "An unexpected error occurred.",
                variant: "destructive",
            });
        }
    };

    const handleStockEdit = (productId: string, currentStock: number) => {
        setEditingStock(productId);
        setNewStockValue(currentStock);
    };

    const handleStockSave = async (productId: string) => {
        await updateStock(productId, newStockValue);
        setEditingStock(null);
    };

    const handleStockCancel = () => {
        setEditingStock(null);
        setNewStockValue(0);
    };

    const getStockBadge = (stock: number) => {
        if (stock === 0) {
            return <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Out of Stock
            </Badge>;
        } else if (stock <= 5) {
            return <Badge variant="secondary" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Low Stock ({stock})
            </Badge>;
        } else {
            return <Badge variant="default" className="flex items-center gap-1">
                <Package className="h-3 w-3" />
                In Stock ({stock})
            </Badge>;
        }
    };

    return (
        <>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold">Inventory Management</h1>
                    <p className="text-muted-foreground">
                        View current stock levels and serial numbers for all products.
                    </p>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Current Inventory</CardTitle>
                        <CardDescription>
                            A live look at all products and their stock status.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="px-2 py-3 text-xs sm:text-sm font-medium">Product Name</TableHead>
                                    <TableHead className="px-2 py-3 text-xs sm:text-sm font-medium">Brand</TableHead>
                                    <TableHead className="px-2 py-3 text-xs sm:text-sm font-medium">Price</TableHead>
                                    <TableHead className="px-2 py-3 text-center text-xs sm:text-sm font-medium">Stock Quantity</TableHead>
                                    <TableHead className="px-2 py-3 text-center text-xs sm:text-sm font-medium">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={`skeleton-${i}`}>
                                            <TableCell className="px-2 py-3"><Skeleton className="h-6 w-48 rounded-md" /></TableCell>
                                            <TableCell className="px-2 py-3"><Skeleton className="h-6 w-24 rounded-md" /></TableCell>
                                            <TableCell className="px-2 py-3"><Skeleton className="h-6 w-16 rounded-md" /></TableCell>
                                            <TableCell className="text-center px-2 py-3"><Skeleton className="h-6 w-12 mx-auto rounded-md" /></TableCell>
                                            <TableCell className="text-center px-2 py-3"><Skeleton className="h-8 w-32 mx-auto rounded-md" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    productList.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-medium px-2 py-3 text-xs sm:text-sm max-w-[200px] lg:max-w-[300px]">
                                                <div className="truncate" title={product.name}>
                                                    {product.name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-2 py-3 text-xs sm:text-sm whitespace-nowrap">
                                                {product.brand || 'Generic'}
                                            </TableCell>
                                            <TableCell className="px-2 py-3 text-xs sm:text-sm whitespace-nowrap">
                                                ₹{(product.price ?? 0).toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-center px-2 py-3 text-xs sm:text-sm whitespace-nowrap">
                                                {editingStock === product.id ? (
                                                    <div className="flex items-center gap-2 justify-center">
                                                        <Input
                                                            type="number"
                                                            value={newStockValue}
                                                            onChange={(e) => setNewStockValue(Number(e.target.value))}
                                                            className="w-16 h-8 text-center text-xs"
                                                            min="0"
                                                        />
                                                        <Button
                                                            size="sm"
                                                            className="h-8 text-xs px-2"
                                                            onClick={() => handleStockSave(product.id)}
                                                        >
                                                            Save
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 text-xs px-2"
                                                            onClick={handleStockCancel}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 justify-center">
                                                        <span className="font-bold text-xs sm:text-sm">{product.stock_quantity || 0}</span>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-7 text-xs px-2"
                                                            onClick={() => handleStockEdit(product.id, product.stock_quantity || 0)}
                                                        >
                                                            Edit
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center px-2 py-3 text-xs sm:text-sm whitespace-nowrap">
                                                <div className="flex items-center gap-1.5 justify-center">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-7 w-7 p-0"
                                                        onClick={() => updateStock(product.id, Math.max(0, (product.stock_quantity || 0) - 1))}
                                                        disabled={(product.stock_quantity || 0) === 0 || editingStock === product.id}
                                                    >
                                                        <Minus className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-7 w-7 p-0"
                                                        onClick={() => updateStock(product.id, (product.stock_quantity || 0) + 1)}
                                                        disabled={editingStock === product.id}
                                                    >
                                                        <Plus className="h-3.5 w-3.5" />
                                                    </Button>
                                                    {product.isSerialNumberCompulsory && (
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            className="h-7 text-xs px-2"
                                                            onClick={() => setSelectedProduct(product)}
                                                            disabled={(product.stock_quantity || 0) === 0}
                                                        >
                                                            Serials ({product.available_serials || 0})
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            {selectedProduct && (
                <ViewSerialsDialog 
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                />
            )}
        </>
    );
}
