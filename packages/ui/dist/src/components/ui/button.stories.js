import { Button } from './button';
const meta = {
    title: 'UI/Button',
    component: Button,
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
        },
        size: {
            control: 'select',
            options: ['default', 'sm', 'lg', 'icon'],
        },
        disabled: {
            control: 'boolean',
        },
    },
};
export default meta;
export const Default = {
    args: {
        children: 'Button',
        variant: 'default',
        size: 'default',
    },
};
export const Destructive = {
    args: {
        children: 'Destructive Button',
        variant: 'destructive',
    },
};
export const Outline = {
    args: {
        children: 'Outline Button',
        variant: 'outline',
    },
};
