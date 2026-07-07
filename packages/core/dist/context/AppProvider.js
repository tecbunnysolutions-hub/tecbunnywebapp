'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { AuthProvider } from './AuthProvider';
export function AppProvider({ children }) {
    return (_jsx(AuthProvider, { children: children }));
}
