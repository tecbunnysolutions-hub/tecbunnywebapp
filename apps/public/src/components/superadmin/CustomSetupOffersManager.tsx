'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';

import { Button } from "@tecbunny/ui";
import { Input } from "@tecbunny/ui";
import { Label } from "@tecbunny/ui";
import { Textarea } from "@tecbunny/ui";
import { Badge } from "@tecbunny/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tecbunny/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tecbunny/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@tecbunny/ui";
import { useToast } from "@tecbunny/ui";
import { logger } from '@/lib/logger';

interface CustomSetupOffer {
  id: string;
  title: string;
  description: string;
  offer_type: 'PERCENTAGE_DISCOUNT' | 'FREE_INSTALLATION' | 'FREE_ACCESSORY';
  offer_value: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

export default function CustomSetupOffersManager() {
  const [offers, setOffers] = useState<CustomSetupOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editingOffer, setEditingOffer] = useState<CustomSetupOffer | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    offer_type: 'PERCENTAGE_DISCOUNT' as 'PERCENTAGE_DISCOUNT' | 'FREE_INSTALLATION' | 'FREE_ACCESSORY',
    offer_value: '',
    start_date: '',
    end_date: '',
    is_active: true,
  });

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/superadmin/custom-setup-offers');
      const data = await res.json();
      if (res.ok) {
        setOffers(data.offers || []);
      } else {
        throw new Error(data.error || 'Failed to load offers');
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingOffer(null);
    setFormData({
      title: '',
      description: '',
      offer_type: 'PERCENTAGE_DISCOUNT',
      offer_value: '',
      start_date: '',
      end_date: '',
      is_active: true,
    });
  };

  const handleSave = async () => {
    if (!formData.title || !formData.start_date || !formData.end_date) {
      toast({ title: 'Error', description: 'Title, start date, and end date are required', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const url = '/api/superadmin/custom-setup-offers';
      const method = editingOffer ? 'PUT' : 'POST';
      const body = editingOffer ? { id: editingOffer.id, ...formData } : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        toast({ title: 'Success', description: data.message });
        await fetchOffers();
        handleCloseDialog();
      } else {
        throw new Error(data.error || 'Failed to save offer');
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (offer: CustomSetupOffer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title,
      description: offer.description || '',
      offer_type: offer.offer_type,
      offer_value: offer.offer_value || '',
      start_date: offer.start_date ? offer.start_date.split('T')[0] : '',
      end_date: offer.end_date ? offer.end_date.split('T')[0] : '',
      is_active: offer.is_active,
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;

    try {
      const res = await fetch(`/api/superadmin/custom-setup-offers?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        toast({ title: 'Success', description: data.message });
        await fetchOffers();
      } else {
        throw new Error(data.error || 'Failed to delete offer');
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const toggleStatus = async (offer: CustomSetupOffer) => {
    try {
      const res = await fetch('/api/superadmin/custom-setup-offers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: offer.id, is_active: !offer.is_active }),
      });
      if (res.ok) {
        toast({ title: 'Success', description: `Offer ${offer.is_active ? 'deactivated' : 'activated'}` });
        await fetchOffers();
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update status');
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tech-heading">Custom Setup Offers</h2>
          <p className="text-sm tech-body">Manage specific offers and bundles exclusively for the Custom Setups calculator.</p>
        </div>
        <Dialog open={showDialog} onOpenChange={(open) => {
          if (!open) handleCloseDialog();
          else setShowDialog(true);
        }}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Create Offer</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{editingOffer ? 'Edit Offer' : 'Create New Offer'}</DialogTitle>
              <DialogDescription>
                Set up dynamic discounts or freebies that automatically apply in the calculator.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Free Installation Weekend"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Details to show the customer..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Offer Type</Label>
                  <Select
                    value={formData.offer_type}
                    onValueChange={(val: any) => setFormData({ ...formData, offer_type: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE_DISCOUNT">Percentage Discount</SelectItem>
                      <SelectItem value="FREE_INSTALLATION">Free Installation</SelectItem>
                      <SelectItem value="FREE_ACCESSORY">Free Accessory</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.offer_type === 'PERCENTAGE_DISCOUNT' && (
                  <div className="grid gap-2">
                    <Label htmlFor="offer_value">Discount Percentage (%)</Label>
                    <Input
                      id="offer_value"
                      type="number"
                      value={formData.offer_value}
                      onChange={(e) => setFormData({ ...formData, offer_value: e.target.value })}
                      placeholder="e.g. 10"
                    />
                  </div>
                )}
                {formData.offer_type === 'FREE_ACCESSORY' && (
                  <div className="grid gap-2">
                    <Label htmlFor="offer_value">Accessory Slug</Label>
                    <Input
                      id="offer_value"
                      value={formData.offer_value}
                      onChange={(e) => setFormData({ ...formData, offer_value: e.target.value })}
                      placeholder="e.g. wall-mount-addon"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end_date">End Date *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Offer'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Validity</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
            ) : offers.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No custom setup offers found.</TableCell></TableRow>
            ) : (
              offers.map((offer) => (
                <TableRow key={offer.id}>
                  <TableCell className="font-medium">{offer.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      {offer.offer_type.replace('_', ' ')} {offer.offer_value && `(${offer.offer_value})`}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {offer.is_active ? <Badge>Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(offer.start_date).toLocaleDateString()} - {new Date(offer.end_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => toggleStatus(offer)}>
                      {offer.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(offer)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(offer.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
