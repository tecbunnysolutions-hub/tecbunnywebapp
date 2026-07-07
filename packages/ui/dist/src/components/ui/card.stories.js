import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';
const meta = {
    title: 'UI/Card',
    component: Card,
    tags: ['autodocs'],
};
export default meta;
export const Default = {
    render: () => (_jsxs(Card, { className: "w-[350px]", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Create project" }), _jsx(CardDescription, { children: "Deploy your new project in one-click." })] }), _jsx(CardContent, { children: _jsx("p", { children: "Card Content goes here." }) }), _jsxs(CardFooter, { className: "flex justify-between", children: [_jsx("button", { children: "Cancel" }), _jsx("button", { children: "Deploy" })] })] })),
};
