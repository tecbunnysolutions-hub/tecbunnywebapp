type GeminiGenerateParams = {
    prompt: string;
    model?: string;
    temperature?: number;
    maxOutputTokens?: number;
    reasoningEffort?: 'low' | 'medium' | 'high' | null;
};
export declare function generateGeminiText({ prompt, model, temperature, maxOutputTokens, reasoningEffort, }: GeminiGenerateParams): Promise<string>;
export {};
//# sourceMappingURL=gemini-service.d.ts.map