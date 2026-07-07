import { IUserRepository, GetUsersParams, GetUsersResult, CreateUserParams, UpdateUserParams, UserTotals } from '@tecbunny/types';
import { logger, normalizeRole, USER_ASSIGNABLE_ROLES } from '@tecbunny/core';
import crypto from 'crypto';
import { BaseSupabaseClient } from '../supabase/base-client';

const STAFF_ROLES = ['sales_executive', 'store_executive', 'sales_agent', 'service_engineer', 'sales_manager', 'service_manager', 'accounts', 'admin'];
const SALES_ROLES = ['sales_executive', 'store_executive', 'sales_agent', 'sales_manager'];
const ROLE_SENTINEL_NONE = '__none__';

export class SupabaseUserRepository implements IUserRepository {
  constructor(private readonly baseClient: BaseSupabaseClient) {}

  private get supabaseAdmin() {
    return this.baseClient.rawClient;
  }

  private parseAssignableRole(value: unknown): string | null {
    const normalized = normalizeRole(value);
    const migratedRole = normalized === 'sales'
      ? 'sales_executive'
      : normalized === 'sales-staff'
        ? 'store_executive'
        : normalized === 'sales-external'
          ? 'sales_agent'
          : normalized === 'manager'
            ? 'sales_manager'
            : normalized;
    return migratedRole && (USER_ASSIGNABLE_ROLES as readonly string[]).includes(migratedRole)
      ? migratedRole
      : null;
  }

  private async syncUserRole(userId: string, role: string): Promise<void> {
    const { data: roleRecord } = await this.baseClient.executeQuery<any>(
      this.supabaseAdmin.from('roles').select('id').eq('name', role).maybeSingle(),
      'sync_role_fetch'
    );

    if (!roleRecord) {
      throw new Error(`Role catalog entry not found for ${role}`);
    }

    await this.baseClient.executeQuery(
      this.supabaseAdmin.from('user_roles').delete().eq('user_id', userId),
      'sync_role_delete_old'
    );

    await this.baseClient.executeQuery(
      this.supabaseAdmin.from('user_roles').insert({
        user_id: userId,
        role_id: roleRecord.id,
      }),
      'sync_role_insert_new'
    );

    const { data: authUser, error: authReadError } = await this.supabaseAdmin.auth.admin.getUserById(userId);
    if (authReadError) throw new Error(`Failed to load auth metadata: ${authReadError.message}`);

    const { error: authUpdateError } = await this.supabaseAdmin.auth.admin.updateUserById(userId, {
      app_metadata: {
        ...(authUser.user?.app_metadata ?? {}),
        role,
      },
    });
    if (authUpdateError) throw new Error(`Failed to synchronize auth role: ${authUpdateError.message}`);
  }

  async getTotals(): Promise<UserTotals> {
    const [totalRes, staffRes, customerRes, salesRes] = await Promise.all([
      this.baseClient.executeQuery(this.supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }), 'totals_all'),
      this.baseClient.executeQuery(this.supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).in('role', STAFF_ROLES), 'totals_staff'),
      this.baseClient.executeQuery(this.supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer'), 'totals_customer'),
      this.baseClient.executeQuery(this.supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).in('role', SALES_ROLES), 'totals_sales')
    ]);

    return {
      total: totalRes.count ?? 0,
      staff: staffRes.count ?? 0,
      customers: customerRes.count ?? 0,
      sales: salesRes.count ?? 0
    };
  }

  async getUsers(params: GetUsersParams): Promise<GetUsersResult> {
    const offset = (params.page - 1) * params.pageSize;
    let roles = params.roles || [];

    if (roles.includes(ROLE_SENTINEL_NONE)) {
      return {
        users: [],
        total: 0,
        page: params.page,
        pageSize: params.pageSize,
        totals: null
      };
    }

    let profileQuery = this.supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact' });

    if (roles.length) {
      profileQuery = profileQuery.in('role', roles);
    }

    if (params.search) {
      const sanitizedSearch = params.search.replace(/[%_]/g, (match: string) => `\\${match}`);
      const pattern = `%${sanitizedSearch}%`;
      profileQuery = profileQuery.or(
        `full_name.ilike.${pattern},email.ilike.${pattern},phone.ilike.${pattern}`
      );
    }

    const { data: profiles, count } = await this.baseClient.executeQuery(
      profileQuery.order(params.sortColumn, { ascending: params.sortDirection === 'asc', nullsFirst: params.sortDirection === 'asc' }).range(offset, offset + params.pageSize - 1),
      'get_users_profiles'
    );

    const profileIds = (profiles || []).map((p: any) => p.id);
    const authUsersMap: Record<string, any> = {};

    if (profileIds.length > 0) {
      try {
        const { data: authSummary } = await this.baseClient.executeQuery(
          this.supabaseAdmin.from('auth_users_summary').select('*').in('id', profileIds),
          'get_users_auth_summary'
        );

        if (authSummary) {
          authSummary.forEach((u: any) => {
            authUsersMap[u.id] = u;
          });
        }
      } catch (err) {
        logger.warn('users.auth_summary_exception_falling_back', { error: err });
        const authUsers = await Promise.all(
          profileIds.map(async (id) => {
            try {
              const { data, error: userError } = await this.supabaseAdmin.auth.admin.getUserById(id);
              return userError || !data?.user ? null : data.user;
            } catch {
              return null;
            }
          })
        );
        profileIds.forEach((id, idx) => {
          if (authUsers[idx]) {
            authUsersMap[id] = authUsers[idx];
          }
        });
      }
    }

    const combinedUsers = (profiles || []).map((profile: any) => {
      const authUser = authUsersMap[profile.id];
      return {
        id: profile.id,
        email: authUser?.email ?? profile.email ?? null,
        email_confirmed_at: authUser?.email_confirmed_at ?? null,
        last_sign_in_at: authUser?.last_sign_in_at ?? null,
        created_at: authUser?.created_at ?? profile.created_at ?? null,
        updated_at: authUser?.updated_at ?? profile.updated_at ?? null,
        banned_until: authUser?.banned_until ?? null,
        profile
      };
    });

    return {
      users: combinedUsers,
      total: count ?? combinedUsers.length,
      page: params.page,
      pageSize: params.pageSize,
      totals: null
    };
  }

  async createUser(params: CreateUserParams): Promise<{ id: string; email: string; created_at: string }> {
    const requestedRole = this.parseAssignableRole(params.role || 'customer');
    if (!requestedRole) {
      throw new Error('Invalid or non-assignable role');
    }

    let password = params.password;
    if (!password || password.trim() === '') {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*()_+';
      const random = (len: number) => {
        let str = '';
        for (let i = 0; i < len; i++) {
          str += chars.charAt(crypto.randomInt(0, chars.length));
        }
        return str;
      };
      password = `${random(4)}-${random(4)}-${random(4)}`;
    }

    const { data: userData, error: createError } = await this.supabaseAdmin.auth.admin.createUser({
      email: params.email,
      password,
      email_confirm: true,
      user_metadata: {
        name: params.name
      },
      app_metadata: { role: requestedRole },
    });

    if (createError || !userData.user) {
      throw new Error(createError?.message || 'Failed to create user');
    }

    try {
      await this.baseClient.executeQuery(
        this.supabaseAdmin.from('profiles').upsert({
          id: userData.user.id,
          name: params.name,
          email: params.email,
          role: requestedRole,
          mobile: params.mobile || null,
          is_active: true,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' }),
        'create_user_profile'
      );
    } catch (profileError) {
      await this.supabaseAdmin.auth.admin.deleteUser(userData.user.id);
      throw new Error('Failed to create user profile');
    }

    try {
      await this.syncUserRole(userData.user.id, requestedRole);
      await this.baseClient.executeQuery(
        this.supabaseAdmin.from('security_audit_log').insert({
          event_type: 'role_alteration',
          user_id: userData.user.id,
          event_data: {
            action: 'staff_user_created',
            new_role: requestedRole,
            modified_by: params.createdBy,
          },
          severity: requestedRole === 'customer' ? 'medium' : 'high',
        }),
        'create_user_audit'
      );
    } catch (roleError: any) {
      await this.supabaseAdmin.auth.admin.deleteUser(userData.user.id);
      throw new Error(roleError.message || 'Failed to assign role');
    }

    return {
      id: userData.user.id,
      email: userData.user.email!,
      created_at: userData.user.created_at
    };
  }

  async getUserProfile(userId: string): Promise<any> {
    const { data: targetProfile } = await this.baseClient.executeQuery<any>(
      this.supabaseAdmin.from('profiles').select('role, id, name').eq('id', userId).single(),
      'get_user_profile'
    );

    if (!targetProfile) {
      throw new Error('User profile not found');
    }
    return targetProfile;
  }

  async updateUser(params: UpdateUserParams): Promise<void> {
    const targetProfile = await this.getUserProfile(params.userId);

    const requestedRole = params.updates.role === undefined ? null : this.parseAssignableRole(params.updates.role);
    if (params.updates.role !== undefined && !requestedRole) {
      throw new Error('Invalid or non-assignable role');
    }

    if (params.updates.email || params.updates.password || params.updates.email_confirm !== undefined) {
      const authUpdates: any = {};
      if (params.updates.email) authUpdates.email = params.updates.email;
      if (params.updates.password) authUpdates.password = params.updates.password;
      if (params.updates.email_confirm !== undefined) authUpdates.email_confirm = params.updates.email_confirm;

      const { error: authError } = await this.supabaseAdmin.auth.admin.updateUserById(params.userId, authUpdates);
      if (authError) throw new Error(authError.message || 'Failed to update user auth details');
    }

    if (params.updates && Object.keys(params.updates).length > 0) {
      const profileUpdates: Record<string, any> = {};
      if (params.updates.name) profileUpdates.name = params.updates.name;
      if (requestedRole) profileUpdates.role = requestedRole;
      if (params.updates.mobile) profileUpdates.mobile = params.updates.mobile;
      if (typeof params.updates.is_active === 'boolean') profileUpdates.is_active = params.updates.is_active;
      if (typeof params.updates.isActive === 'boolean') profileUpdates.is_active = params.updates.isActive;
      if (params.updates.address) profileUpdates.address = params.updates.address;
      if (params.updates.gstin) profileUpdates.gstin = params.updates.gstin;

      const customerCategory = params.updates.customer_category ?? params.updates.customerCategory;
      if (customerCategory) profileUpdates.customer_category = customerCategory;

      if (params.updates.discount_percentage !== undefined) profileUpdates.discount_percentage = params.updates.discount_percentage;
      if (params.updates.discountPercentage !== undefined) profileUpdates.discount_percentage = params.updates.discountPercentage;

      profileUpdates.updated_at = new Date().toISOString();

      if (Object.keys(profileUpdates).length > 0) {
        await this.baseClient.executeQuery(
          this.supabaseAdmin.from('profiles').update(profileUpdates).eq('id', params.userId),
          'update_user_profile'
        );
      }

      if (requestedRole && requestedRole !== targetProfile.role) {
        try {
          await this.syncUserRole(params.userId, requestedRole);
          await this.baseClient.executeQuery(
            this.supabaseAdmin.from('security_audit_log').insert({
              event_type: 'role_alteration',
              user_id: params.userId,
              event_data: {
                action: 'set',
                previous_role: targetProfile.role,
                new_role: requestedRole,
                modified_by: params.updatedBy,
              },
              severity: 'high',
            }),
            'update_user_audit'
          );
        } catch (roleError: any) {
          await this.baseClient.executeQuery(
            this.supabaseAdmin.from('profiles').update({
              role: targetProfile.role,
              updated_at: new Date().toISOString(),
            }).eq('id', params.userId),
            'rollback_user_profile'
          );
          const previousRole = this.parseAssignableRole(targetProfile.role);
          if (previousRole) {
            await this.syncUserRole(params.userId, previousRole).catch(() => {});
          }
          throw new Error(roleError.message || 'Failed to assign role');
        }
      }
    }
  }

  async deleteUser(userId: string): Promise<void> {
    const { error: deleteError } = await this.supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteError) {
      throw new Error(deleteError.message || 'Failed to delete user');
    }
  }
}
