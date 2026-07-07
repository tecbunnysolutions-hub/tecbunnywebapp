import { IUserRepository } from '@tecbunny/types';
import { validatePayload, GetUsersSchema, CreateUserSchema, UpdateUserSchema, DeleteUserSchema } from '../validation';
import { AppError, Result, success, failure } from '../errors';

export class UserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async getUsers(rawParams: unknown): Promise<Result<any>> {
    const validated = validatePayload(GetUsersSchema, rawParams);
    if (!validated.success) return validated;
    const params = validated.data;

    let effectiveRoles = params.roles;
    if (params.operatorRole !== 'superadmin') {
      effectiveRoles = ['customer'];
    }

    try {
      const data = await this.userRepository.getUsers({
        ...params,
        roles: effectiveRoles,
      });
      return success(data);
    } catch (error: any) {
      return failure(AppError.internal('Failed to get users', error));
    }
  }

  async getTotals(operatorRole: string | null): Promise<Result<any>> {
    try {
      if (operatorRole === 'superadmin') {
        const data = await this.userRepository.getTotals();
        return success(data);
      }
      // Only return totals for customers if not superadmin
      const users = await this.userRepository.getUsers({
        page: 1,
        pageSize: 1,
        search: '',
        roles: ['customer'],
        sortColumn: 'name',
        sortDirection: 'asc'
      });
      return success({
        total: users.total,
        staff: 0,
        customers: users.total,
        sales: 0
      });
    } catch (error: any) {
      return failure(AppError.internal('Failed to get totals', error));
    }
  }

  async createUser(rawParams: unknown): Promise<Result<any>> {
    const validated = validatePayload(CreateUserSchema, rawParams);
    if (!validated.success) return validated;
    const params = validated.data;

    if (params.operatorRole !== 'superadmin' && params.role !== undefined) {
      return failure(AppError.forbidden('Only Superadmin can assign roles'));
    }

    try {
      const data = await this.userRepository.createUser({
        email: params.email,
        name: params.name,
        role: params.role || 'customer',
        mobile: params.mobile,
        password: params.password,
        createdBy: params.operatorId
      });
      return success(data);
    } catch (error: any) {
      return failure(AppError.internal('Failed to create user', error));
    }
  }

  async updateUser(rawParams: unknown): Promise<Result<any>> {
    const validated = validatePayload(UpdateUserSchema, rawParams);
    if (!validated.success) return validated;
    const params = validated.data;

    try {
      const targetProfile = await this.userRepository.getUserProfile(params.userId);
      
      if (targetProfile.role === 'superadmin') {
        return failure(AppError.forbidden('The root Superadmin role cannot be modified here'));
      }

      if (params.operatorRole !== 'superadmin') {
        if (params.updates.role !== undefined) {
          return failure(AppError.forbidden('Only Superadmin can change roles and permissions'));
        }
        if (targetProfile.role !== 'customer') {
          return failure(AppError.forbidden('Admins cannot update non-customer profiles'));
        }
      }

      const data = await this.userRepository.updateUser({
        userId: params.userId,
        updates: params.updates,
        updatedBy: params.operatorId
      });
      return success(data);
    } catch (error: any) {
      return failure(AppError.internal('Failed to update user', error));
    }
  }

  async deleteUser(rawParams: unknown): Promise<Result<any>> {
    const validated = validatePayload(DeleteUserSchema, rawParams);
    if (!validated.success) return validated;
    const params = validated.data;

    if (params.userId === params.operatorId) {
      return failure(AppError.badRequest('Cannot delete your own account'));
    }

    try {
      const targetProfile = await this.userRepository.getUserProfile(params.userId);

      if (params.operatorRole !== 'superadmin') {
        if (targetProfile.role !== 'customer') {
          return failure(AppError.forbidden('Admins cannot delete non-customer profiles'));
        }
      }

      const data = await this.userRepository.deleteUser(params.userId, params.operatorId);
      return success(data);
    } catch (error: any) {
      return failure(AppError.internal('Failed to delete user', error));
    }
  }
}
