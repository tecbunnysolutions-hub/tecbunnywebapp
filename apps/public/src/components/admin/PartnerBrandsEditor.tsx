'use client';

import * as React from 'react';
import { Trash, Plus, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export const parsePartnerBrands = (raw: string | undefined): Array<{ name: string; logoUrl: string }> => {
  if (!raw) return [];
  const trimmed = raw.trim();
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map(item => ({
          name: typeof item === 'object' && item?.name ? String(item.name) : '',
          logoUrl: typeof item === 'object' && item?.logoUrl ? String(item.logoUrl) : '',
        }));
      }
    } catch (e) {
      console.error('Failed to parse partnerBrands JSON:', e);
    }
  }
  // Fallback to comma-separated list
  return trimmed
    .split(',')
    .map(b => b.trim())
    .filter(Boolean)
    .map(name => ({ name, logoUrl: '' }));
};

export const PartnerBrandsEditor = ({ 
  value, 
  onChange, 
}: { 
  value: string; 
  onChange: (newValue: string) => void;
}) => {
  const brands = React.useMemo(() => parsePartnerBrands(value), [value]);
  const [newBrandName, setNewBrandName] = React.useState('');
  const [isUploadingBrand, setIsUploadingBrand] = React.useState(false);
  const { toast } = useToast();

  const uploadBrandFile = async (file: File): Promise<string> => {
    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file');
      }
      if (file.size > 4 * 1024 * 1024) {
        throw new Error('File size must be less than 4MB');
      }
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'brand');
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        const errMsg = typeof errorData.error === 'object' && errorData.error?.message
          ? errorData.error.message
          : (typeof errorData.error === 'string' ? errorData.error : `Upload failed: ${response.statusText}`);
        throw new Error(errMsg);
      }
      
      const data = await response.json();
      const imageUrl = data.secure_url || data.url;
      if (!imageUrl) {
        throw new Error('Invalid response from upload service');
      }
      return imageUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: `Failed to upload brand image: ${errorMessage}`,
      });
      throw error;
    }
  };

  const handleDelete = (index: number) => {
    const updated = brands.filter((_, i) => i !== index);
    onChange(JSON.stringify(updated));
  };

  const handleAdd = async () => {
    if (!newBrandName.trim()) return;

    const fileInput = document.getElementById('new-brand-logo') as HTMLInputElement;
    const file = fileInput?.files?.[0];
    let logoUrl = '';
    
    if (file) {
      setIsUploadingBrand(true);
      try {
        logoUrl = await uploadBrandFile(file);
      } catch (e) {
        setIsUploadingBrand(false);
        return; // Stop if upload failed
      }
      setIsUploadingBrand(false);
    }
    
    const updated = [...brands, { name: newBrandName.trim(), logoUrl }];
    onChange(JSON.stringify(updated));
    setNewBrandName('');
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="space-y-6 mt-4">
      {/* Grid of existing brands */}
      {brands.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {brands.map((brand, idx) => (
            <div key={idx} className="relative group border border-border rounded-lg p-4 flex flex-col items-center justify-center gap-3 bg-zinc-50 dark:bg-zinc-900/50 hover:border-primary/50 transition-colors">
              <Button 
                type="button"
                variant="destructive" 
                size="icon" 
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                onClick={() => handleDelete(idx)}
              >
                <Trash className="h-3 w-3" />
              </Button>
              <div className="h-14 w-full flex items-center justify-center bg-white rounded-md p-2 shadow-sm">
                {brand.logoUrl ? (
                  <img src={brand.logoUrl} alt={brand.name} className="max-h-full max-w-full object-contain" />
                ) : (
                  <div className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">No Logo</div>
                )}
              </div>
              <span className="text-xs font-semibold text-center truncate w-full text-foreground">{brand.name}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center border rounded-lg border-dashed text-sm text-muted-foreground bg-muted/20">
          No partner brands configured.
        </div>
      )}
      
      {/* Add New Brand Section */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-4 shadow-sm">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Plus className="h-4 w-4 text-primary" /> Add New Brand
        </h4>
        <div className="flex flex-col sm:flex-row items-end gap-4">
          <div className="space-y-2 flex-1 w-full">
            <Label htmlFor="brand-name" className="text-xs font-medium text-muted-foreground">Brand Name</Label>
            <Input 
              id="brand-name" 
              placeholder="e.g. DAHUA" 
              value={newBrandName} 
              onChange={e => setNewBrandName(e.target.value)} 
              className="bg-background"
            />
          </div>
          <div className="space-y-2 flex-1 w-full">
            <Label htmlFor="new-brand-logo" className="text-xs font-medium text-muted-foreground">Brand Logo (Optional)</Label>
            <Input 
              id="new-brand-logo" 
              type="file" 
              accept="image/*"
              disabled={isUploadingBrand}
              className="bg-background cursor-pointer file:cursor-pointer file:text-primary file:font-semibold"
            />
          </div>
          <Button 
            type="button"
            disabled={isUploadingBrand || !newBrandName.trim()}
            onClick={handleAdd}
            className="w-full sm:w-auto min-w-[120px]"
          >
            {isUploadingBrand ? (
              <span className="flex items-center gap-2 animate-pulse">Uploading...</span>
            ) : (
              <span className="flex items-center gap-2"><Upload className="h-4 w-4" /> Add Brand</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
