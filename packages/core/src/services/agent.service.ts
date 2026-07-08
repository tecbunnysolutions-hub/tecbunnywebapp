import { AppError, Result, success, failure } from '../errors';

export class AgentService {
  constructor(private readonly supabase: any) {}

  async applyForAgent(userId: string, email: string | undefined): Promise<Result<any>> {
    // Check if already an agent
    const { data: existing, error: fetchErr } = await this.supabase
      .from('sales_agents')
      .select('id,status,referral_code')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchErr && !String(fetchErr.message || '').includes('No rows')) {
      return failure(AppError.internal('Failed to check existing application', fetchErr.message));
    }

    if (existing) {
      return success({
        message: existing.status === 'approved' ? 'You are already an approved agent' : 'Application already submitted',
        agent: existing,
        alreadyExists: true
      });
    }

    // Generate unique referral code
    const base = (email || userId).split('@')[0]?.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8) || 'AGENT';
    const candidate = `${base.toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const { data: created, error: insertErr } = await this.supabase
      .from('sales_agents')
      .insert({ user_id: userId, referral_code: candidate, status: 'pending' })
      .select('*')
      .single();

    if (insertErr) {
      return failure(AppError.badRequest('Failed to submit application', insertErr.message));
    }

    return success({
      message: 'Application submitted successfully',
      agent: created,
      alreadyExists: false
    });
  }
}
