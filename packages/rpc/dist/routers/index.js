import { router } from '../trpc';
import { pageContentRouter } from './pageContent';
import { featureFlagsRouter } from './featureFlags';
export const appRouter = router({
    pageContent: pageContentRouter,
    featureFlags: featureFlagsRouter,
});
