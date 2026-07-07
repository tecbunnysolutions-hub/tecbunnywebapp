import { IUserRepository } from '@tecbunny/types';
import { Result } from '../errors';
export declare class UserService {
    private readonly userRepository;
    constructor(userRepository: IUserRepository);
    getUsers(rawParams: unknown): Promise<Result<any>>;
    getTotals(operatorRole: string | null): Promise<Result<any>>;
    createUser(rawParams: unknown): Promise<Result<any>>;
    updateUser(rawParams: unknown): Promise<Result<any>>;
    deleteUser(rawParams: unknown): Promise<Result<any>>;
}
//# sourceMappingURL=user.service.d.ts.map