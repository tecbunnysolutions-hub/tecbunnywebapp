import { env, EnvSchema, EnvironmentConfig, environmentValidation } from './config/env';

// For backwards compatibility
export const environmentValidator = {
  getConfig: () => env,
  isValid: () => environmentValidation.isValid(),
  getErrors: () => environmentValidation.getErrors(),
  getWarnings: () => environmentValidation.getWarnings(),
  getFeatureStatus: () => ({
    email: Boolean(env.smtp?.host && env.smtp?.user && env.smtp?.pass),
    whatsapp: Boolean(env.whatsapp?.apiKey && env.whatsapp?.baseUrl),
  })
};
export const envConfig = env;
export { EnvSchema };
export type { EnvironmentConfig };
export default environmentValidator;
