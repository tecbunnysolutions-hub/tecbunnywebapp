import React from 'react';
import type { SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import type { User } from '../types';
type OTPChannel = 'email' | 'whatsapp';
interface SignupDetails {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    captchaToken?: string;
    preferredChannel?: OTPChannel;
}
interface AuthData {
    user?: SupabaseUser | User;
    session?: any;
    profile?: any;
    [key: string]: unknown;
}
interface AuthResponse {
    success: boolean;
    message: string;
    data?: AuthData;
    error?: string;
}
export interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<AuthResponse>;
    loginWithOAuth: (provider: 'google' | 'github') => Promise<void>;
    logout: (options?: {
        redirectTo?: string;
        silent?: boolean;
    }) => Promise<void>;
    signup: (details: SignupDetails) => Promise<AuthResponse>;
    resendConfirmation: (email: string) => Promise<AuthResponse>;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    updateUser: (updatedUser: User) => void;
    supabase: SupabaseClient;
}
export declare const AuthContext: React.Context<AuthContextType | undefined>;
export declare const AuthProvider: React.FC<{
    children: React.ReactNode;
}>;
export declare const useAuth: () => AuthContextType;
export {};
//# sourceMappingURL=AuthProvider.d.ts.map