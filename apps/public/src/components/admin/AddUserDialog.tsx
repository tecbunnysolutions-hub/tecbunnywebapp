'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { UserPlus } from 'lucide-react';

import { Button } from "@tecbunny/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@tecbunny/ui";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@tecbunny/ui";
import { Input } from "@tecbunny/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tecbunny/ui";
import { useToast } from "@tecbunny/ui";
import {
  EFFECTIVE_PERMISSIONS,
  ROLE_DESCRIPTION,
  ROLE_DISPLAY_NAME,
  USER_ASSIGNABLE_ROLES,
  type AssignableRole,
} from '@/lib/roles';

const addUserSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  mobile: z.string().min(10, { message: 'Please enter a valid mobile number.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }).optional(),
  confirmPassword: z.string().min(6, { message: 'Please confirm your password.' }).optional(),
  role: z.enum(USER_ASSIGNABLE_ROLES, {
    message: 'Please select a role.',
  }),
}).refine((data) => {
  if (!data.password && !data.confirmPassword) return true; // both optional
  return data.password === data.confirmPassword;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type AddUserFormValues = z.infer<typeof addUserSchema>;

interface AddUserDialogProps {
  onUserAdded?: () => void;
  canManageStaffRoles?: boolean;
}

export function AddUserDialog({ onUserAdded, canManageStaffRoles = false }: AddUserDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      name: '',
      email: '',
      mobile: '',
      password: '',
      confirmPassword: '',
      role: 'customer',
    },
  });
  const selectedRole = form.watch('role') as AssignableRole;
  const availableRoles = canManageStaffRoles ? USER_ASSIGNABLE_ROLES : (['customer'] as const);
  const effectivePermissions = Array.from(EFFECTIVE_PERMISSIONS[selectedRole] || []).sort();

  const onSubmit = async (values: AddUserFormValues) => {
    try {
      setIsSubmitting(true);
      // Use server API so email is auto-confirmed and credentials emailed
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          name: values.name,
          mobile: values.mobile,
          ...(canManageStaffRoles ? { role: values.role } : {}),
          password: values.password, // optional; server will generate if missing
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to create user (status ${res.status})`);
      }

      toast({
        title: 'User created successfully!',
        description: `New ${values.role} user has been added. Credentials emailed to the user.`,
      });

      setOpen(false);
      form.reset();
      
      // Call the callback to refresh the users list
      if (onUserAdded) {
        onUserAdded();
      }
    } catch (error) {
      toast({
        title: 'Error creating user',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add New User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account with the specified role and permissions.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email address" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="mobile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter mobile number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {canManageStaffRoles && (
              <>
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableRoles.map((role) => (
                            <SelectItem key={role} value={role}>
                              {ROLE_DISPLAY_NAME[role]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-sm font-medium">{ROLE_DISPLAY_NAME[selectedRole]}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{ROLE_DESCRIPTION[selectedRole]}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {effectivePermissions.map((permission) => (
                      <span key={permission} className="rounded border bg-background px-2 py-1 font-mono text-[11px]">
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter password" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input placeholder="Confirm password" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Creating User...' : 'Create User'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
