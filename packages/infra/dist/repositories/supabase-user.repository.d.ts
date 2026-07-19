import { IUserRepository, GetUsersParams, GetUsersResult, CreateUserParams, UpdateUserParams, UserTotals } from '@tecbunny/types';
import { BaseSupabaseClient } from '../supabase/base-client';
export declare class SupabaseUserRepository implements IUserRepository {
    private readonly baseClient;
    constructor(baseClient: BaseSupabaseClient);
    private get supabaseAdmin();
    private parseAssignableRole;
    private syncUserRole;
    getTotals(): Promise<UserTotals>;
    private profileName;
    private profileMobile;
    private buildAuthOnlyProfile;
    private getAuthOnlyUsers;
    getUsers(params: GetUsersParams): Promise<GetUsersResult>;
    createUser(params: CreateUserParams): Promise<{
        id: string;
        email: string;
        created_at: string;
    }>;
    getUserProfile(userId: string): Promise<any>;
    updateUser(params: UpdateUserParams): Promise<void>;
    deleteUser(userId: string): Promise<void>;
}
//# sourceMappingURL=supabase-user.repository.d.ts.map