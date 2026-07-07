declare global {
    interface Window {
        dataLayer?: unknown[];
        gtag?: (...args: unknown[]) => void;
    }
}
interface UseAnalyticsOptions {
    autoTrackPageView?: boolean;
}
export declare const useAnalytics: ({ autoTrackPageView }?: UseAnalyticsOptions) => {
    trackEvent: (eventType: string, data?: Record<string, unknown>) => Promise<void>;
};
export {};
//# sourceMappingURL=use-analytics.d.ts.map