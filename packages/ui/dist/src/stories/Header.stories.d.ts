import type { StoryObj } from '@storybook/react-vite';
declare const meta: {
    title: string;
    component: ({ user, onLogin, onLogout, onCreateAccount }: import("./Header.tsx").HeaderProps) => import("react/jsx-runtime").JSX.Element;
    tags: string[];
    parameters: {
        layout: string;
    };
    args: {
        onLogin: import("storybook/test").Mock<(...args: any[]) => any>;
        onLogout: import("storybook/test").Mock<(...args: any[]) => any>;
        onCreateAccount: import("storybook/test").Mock<(...args: any[]) => any>;
    };
};
export default meta;
type Story = StoryObj<typeof meta>;
export declare const LoggedIn: Story;
export declare const LoggedOut: Story;
//# sourceMappingURL=Header.stories.d.ts.map