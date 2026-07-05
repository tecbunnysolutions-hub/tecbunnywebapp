'use client';

import * as React from 'react';

import { UserCog, User as UserIcon, Shield, Settings, Star, Crown, Headphones } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@tecbunny/ui";
import { Button } from "@tecbunny/ui";
import { Input } from "@tecbunny/ui";
import { Label } from "@tecbunny/ui";
import { Switch } from "@tecbunny/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tecbunny/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@tecbunny/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@tecbunny/ui";
import { useToast } from "@tecbunny/ui";
import { logger } from "@tecbunny/core/logger";
import type { User, CustomerCategory } from "@tecbunny/core/types";
import type { UserRole } from "@tecbunny/core";
import {
  EFFECTIVE_PERMISSIONS,
  ROLE_DESCRIPTION,
  ROLE_DISPLAY_NAME,
  USER_ASSIGNABLE_ROLES,
  type AssignableRole,
} from "@tecbunny/core/roles";

interface EditUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUserUpdated: () => void;
  canManageStaffRoles?: boolean;
}

export function EditUserDialog({ isOpen, onClose, user, onUserUpdated, canManageStaffRoles = false }: EditUserDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    mobile: '',
    role: 'customer' as UserRole,
    customerCategory: 'Normal' as CustomerCategory,
    isActive: true,
    address: '',
    gstin: '',
  });

  const { toast } = useToast();
  const availableRoles = canManageStaffRoles ? USER_ASSIGNABLE_ROLES : (['customer'] as const);
  const selectedAssignableRole = (USER_ASSIGNABLE_ROLES as readonly string[]).includes(formData.role)
    ? formData.role as AssignableRole
    : 'customer';
  const effectivePermissions = Array.from(EFFECTIVE_PERMISSIONS[selectedAssignableRole] || []).sort();

  React.useEffect(() => {
    if (user) {
      const migratedRole = user.role === 'sales'
        ? 'sales_executive'
        : user.role === 'sales-staff'
          ? 'store_executive'
          : user.role === 'sales-external'
            ? 'sales_agent'
            : user.role === 'manager'
              ? 'sales_manager'
              : user.role;
      setFormData({
        name: user.name || '',
        email: user.email || '',
        mobile: user.mobile || '',
        role: migratedRole || 'customer',
        customerCategory: user.customerCategory || 'Normal',
        isActive: user.isActive ?? true,
        address: user.address || '',
        gstin: user.gstin || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    
    // Prepare update data with core fields
    const updateData: any = {
      name: formData.name,
      mobile: formData.mobile,
      role: formData.role,
      is_active: formData.isActive,
      updated_at: new Date().toISOString(),
    };

    // Only add customer_category if role is customer
    if (formData.role === 'customer') {
      updateData.customer_category = formData.customerCategory;
    }

    // Try to add address and gstin - these might not exist if migration hasn't been applied
    if (formData.address) {
      updateData.address = formData.address;
    }
    if (formData.gstin) {
      updateData.gstin = formData.gstin;
    }

    try {
      // Prefer server API that uses service role so RLS cannot block admin role changes
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          updates: {
            name: formData.name,
            mobile: formData.mobile,
            ...(canManageStaffRoles ? { role: formData.role } : {}),
            customerCategory: formData.role === 'customer' ? formData.customerCategory : undefined,
            isActive: formData.isActive,
            address: formData.address || undefined,
            gstin: formData.gstin || undefined,
          },
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Failed to update user (status ${response.status})`);
      }

      toast({
        title: 'User Updated',
        description: 'User information has been updated successfully.',
      });

      onUserUpdated();
      onClose();
    } catch (error: any) {
      logger.error('Error updating user in EditUserDialog', { error, updateData, userId: user?.id });
      
      let errorMessage = 'Unknown error occurred';
      let errorDetails = '';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.details) {
        errorMessage = error.details;
      } else if (error?.hint) {
        errorMessage = error.hint;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.code) {
        errorMessage = `Database error (${error.code})`;
        if (error?.code === '42703') {
          errorDetails = ' - Column does not exist. Database migration may be needed.';
        }
      }
      
      // Check if it might be a column error
      if (errorMessage.includes('column') && errorMessage.includes('does not exist')) {
        errorDetails = ' - This usually means the database migration needs to be applied.';
      }
      
      toast({
        title: 'Update Failed',
        description: `Failed to update user information: ${errorMessage}${errorDetails}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
      case 'superadmin':
        return <Shield className="h-4 w-4" />;
      case 'manager':
      case 'sales_manager':
      case 'service_manager':
        return <Settings className="h-4 w-4" />;
      case 'sales':
      case 'sales_executive':
      case 'store_executive':
      case 'sales_agent':
      case 'accounts':
        return <UserCog className="h-4 w-4" />;
      case 'service_engineer':
        return <Headphones className="h-4 w-4" />;
      default:
        return <UserIcon className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (category: CustomerCategory) => {
    switch (category) {
      case 'Premium':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'Standard':
        return <Star className="h-4 w-4 text-blue-500" />;
      default:
        return <UserIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Edit User - {user?.name}
          </DialogTitle>
          <DialogDescription>
            {canManageStaffRoles
              ? 'Manage user information, staff roles, inherited permissions, and customer categories.'
              : 'Manage customer information and customer categories.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className={`grid w-full ${canManageStaffRoles ? 'grid-cols-3' : 'grid-cols-2'}`}>
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              {canManageStaffRoles && <TabsTrigger value="permissions">Role & Permissions</TabsTrigger>}
              <TabsTrigger value="customer">Customer Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                  <CardDescription>Update user's personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        disabled
                        className="bg-white/5 border-white/10 text-slate-200"
                      />
                      <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="mobile">Mobile Number</Label>
                      <Input
                        id="mobile"
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gstin">GSTIN (Optional)</Label>
                      <Input
                        id="gstin"
                        value={formData.gstin}
                        onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                        placeholder="Enter GSTIN if applicable"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Enter full address"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                    <Label htmlFor="isActive" className="text-sm">
                      Active User {formData.isActive ? '(Enabled)' : '(Disabled)'}
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {canManageStaffRoles && <TabsContent value="permissions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Role & Permissions</CardTitle>
                  <CardDescription>Change user role and access level</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">User Role</Label>
                    <Select value={formData.role} onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}>
                      <SelectTrigger>
                        <SelectValue>
                          <div className="flex items-center gap-2">
                            {getRoleIcon(formData.role)}
                            <span>{ROLE_DISPLAY_NAME[formData.role] || formData.role}</span>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {availableRoles.map((role) => (
                          <SelectItem key={role} value={role}>
                            <div className="flex items-center gap-2">
                              {getRoleIcon(role)}
                              {ROLE_DISPLAY_NAME[role]}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
                    <h4 className="font-medium">{ROLE_DISPLAY_NAME[selectedAssignableRole]}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {ROLE_DESCRIPTION[selectedAssignableRole]}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {effectivePermissions.map((permission) => (
                        <span key={permission} className="rounded border bg-background px-2 py-1 font-mono text-[11px]">
                          {permission}
                        </span>
                      ))}
                    </div>
                    <div className="hidden text-sm text-muted-foreground space-y-1">
                      {formData.role === 'customer' && (
                        <>
                          <div>• Browse and purchase products</div>
                          <div>• View order history</div>
                          <div>• Access customer support</div>
                        </>
                      )}
                      {formData.role === 'sales' && (
                        <>
                          <div>• Manage customer orders</div>
                          <div>• View inventory</div>
                          <div>• Process payments</div>
                          <div>• Generate invoices</div>
                        </>
                      )}
                      {formData.role === 'accounts' && (
                        <>
                          <div>• View financial reports</div>
                          <div>• Manage invoices and payments</div>
                          <div>• Access accounting dashboard</div>
                        </>
                      )}
                      {formData.role === 'manager' && (
                        <>
                          <div>• All sales and accounts permissions</div>
                          <div>• Manage staff users</div>
                          <div>• View analytics and reports</div>
                          <div>• Configure discounts and offers</div>
                        </>
                      )}
                      {formData.role === 'admin' && (
                        <>
                          <div>• Full system access</div>
                          <div>• Manage all users and roles</div>
                          <div>• System configuration</div>
                          <div>• Product catalog management</div>
                        </>
                      )}
                      {formData.role === 'superadmin' && (
                        <>
                          <div>• God mode access</div>
                          <div>• Manage system configurations</div>
                          <div>• Delete users</div>
                          <div>• Override all settings</div>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>}

            <TabsContent value="customer" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Customer Settings</CardTitle>
                  <CardDescription>
                    {formData.role === 'customer' ? 'Configure customer category for classification purposes' : 'Customer settings only apply to users with Customer role'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.role === 'customer' ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="customerCategory">Customer Category</Label>
                        <Select 
                          value={formData.customerCategory} 
                          onValueChange={(value: CustomerCategory) => {
                            setFormData({ 
                              ...formData, 
                              customerCategory: value
                            });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue>
                              <div className="flex items-center gap-2">
                                {getCategoryIcon(formData.customerCategory)}
                                <span>{formData.customerCategory}</span>
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Normal">
                              <div className="flex items-center gap-2">
                                <UserIcon className="h-4 w-4 text-gray-500" />
                                Normal Customer
                              </div>
                            </SelectItem>
                            <SelectItem value="Standard">
                              <div className="flex items-center gap-2">
                                <Star className="h-4 w-4 text-blue-500" />
                                Standard Customer
                              </div>
                            </SelectItem>
                            <SelectItem value="Premium">
                              <div className="flex items-center gap-2">
                                <Crown className="h-4 w-4 text-yellow-500" />
                                Premium Customer
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          {getCategoryIcon(formData.customerCategory)}
                          {formData.customerCategory} Customer Classification
                        </h4>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>• Customer category for internal classification</div>
                          {formData.customerCategory === 'Standard' && (
                            <>
                              <div>• Enhanced service tier</div>
                              <div>• Priority support access</div>
                            </>
                          )}
                          {formData.customerCategory === 'Premium' && (
                            <>
                              <div>• VIP service tier</div>
                              <div>• Exclusive customer support</div>
                              <div>• Premium service features</div>
                            </>
                          )}
                          <div className="mt-2 text-xs font-medium text-blue-600">
                            Note: Discounts and offers are managed in the Discount Management section
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <UserIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Customer settings are only available for users with Customer role.</p>
                      <p className="text-sm">Change the role to "Customer" to configure category classification.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
