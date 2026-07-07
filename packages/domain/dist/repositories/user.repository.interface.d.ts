export interface GetUsersParams {
    page: number;
    pageSize: number;
    search?: string;
    roles?: string[];
    status?: string;
    customerCategory?: string[];
    discountMin?: number | null;
    discountMax?: number | null;
    sortColumn: string;
    sortDirection: 'asc' | 'desc';
    includeCounts?: boolean;
}
export interface UserTotals {
    total: number;
    staff: number;
    customers: number;
    sales: number;
}
export interface GetUsersResult {
    users: any[];
    total: number;
    page: number;
    pageSize: number;
    totals: UserTotals | null;
}
export interface CreateUserParams {
    email: string;
    name: string;
    role: string;
    mobile?: string;
    password?: string;
    createdBy: string;
}
export interface UpdateUserParams {
    userId: string;
    updates: Record<string, any>;
    updatedBy: string;
}
export interface IUserRepository {
    getTotals(): Promise<UserTotals>;
    getUsers(params: GetUsersParams): Promise<GetUsersResult>;
    createUser(params: CreateUserParams): Promise<{
        id: string;
        email: string;
        created_at: string;
    }>;
    updateUser(params: UpdateUserParams): Promise<void>;
    deleteUser(userId: string, requestedBy: string): Promise<void>;
    getUserProfile(userId: string): Promise<any>;
}
//# sourceMappingURL=user.repository.interface.d.ts.map