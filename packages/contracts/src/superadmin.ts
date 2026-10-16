import { z } from 'zod';

import { apiEnvelope } from './envelope';
import type { SuperadminCommandCenterData } from './superadmin-dashboard';

export const CommandCenterSchema = z.looseObject({}) as unknown as z.ZodType<SuperadminCommandCenterData>;
export const CommandCenterResponseSchema = apiEnvelope(CommandCenterSchema);


import type { LeadCommandCenterData } from './lead-command-center';

export const LeadCommandCenterSchema = z.looseObject({}) as unknown as z.ZodType<LeadCommandCenterData>;
