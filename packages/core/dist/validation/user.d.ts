import { z } from 'zod';
export declare const GetUsersSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    pageSize: z.ZodDefault<z.ZodNumber>;
    search: z.ZodDefault<z.ZodString>;
    roles: z.ZodDefault<z.ZodArray<z.ZodString>>;
    sortColumn: z.ZodDefault<z.ZodString>;
    sortDirection: z.ZodDefault<z.ZodEnum<{
        desc: "desc";
        asc: "asc";
    }>>;
    operatorRole: z.ZodDefault<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const CreateUserSchema: z.ZodObject<{
    email: z.ZodString;
    name: z.ZodString;
    role: z.ZodOptional<z.ZodString>;
    mobile: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodString>;
    operatorRole: z.ZodNullable<z.ZodString>;
    operatorId: z.ZodString;
}, z.core.$strip>;
export declare const UpdateUserSchema: z.ZodObject<{
    userId: z.ZodString;
    updates: z.ZodRecord<z.ZodString, z.ZodAny>;
    operatorRole: z.ZodNullable<z.ZodString>;
    operatorId: z.ZodString;
}, z.core.$strip>;
export declare const DeleteUserSchema: z.ZodObject<{
    userId: z.ZodString;
    operatorRole: z.ZodNullable<z.ZodString>;
    operatorId: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=user.d.ts.map