import { NextRequest, NextResponse } from 'next/server';

import { generateGeminiText } from '@tecbunny/core/ai/gemini-service';
import { logger } from '@tecbunny/core/logger';
import { createSupabaseServiceClient } from '@tecbunny/database/admin';

import { getSuperadminCommandCenterData } from '@/lib/superadmin-dashboard-data';
import { requireSuperadminApi } from '@/lib/superadmin-api';

export const dynamic = 'force-dynamic';

async function persistAiQueryAudit(question: string, answer: string, provider: string, userLabel: string) {
  try {
    const supabase = createSupabaseServiceClient();
    await supabase.from('enterprise_audit_logs').insert({
      user_email: userLabel,
      application: 'superadmin',
      module: 'dashboard',
      screen: 'command-center',
      action: 'dashboard_ai_query',
      entity_type: 'ai_prompt',
      new_value: {
        question: question.slice(0, 500),
        answer_preview: answer.slice(0, 500),
        provider,
      },
      success: true,
      remarks: 'Superadmin natural-language dashboard query',
    });
  } catch (error) {
    logger.warn('superadmin_dashboard_ask.audit_persist_failed', { error });
  }
}

function compactDashboardContext(data: Awaited<ReturnType<typeof getSuperadminCommandCenterData>>) {
  return {
    generatedAt: data.generatedAt,
    healthScore: data.healthScore,
    readinessPercent: data.readinessPercent,
    executiveMetrics: data.executiveMetrics.map(({ label, displayValue, severity, source }) => ({ label, displayValue, severity, source })),
    businessMetrics: data.businessMetrics.map(({ label, displayValue, severity, source }) => ({ label, displayValue, severity, source })),
    realtimeMetrics: data.realtimeMetrics.map(({ label, displayValue, severity, source }) => ({ label, displayValue, severity, source })),
    notifications: data.notifications.slice(0, 8).map(({ module, severity, businessImpact, recommendedSolution }) => ({ module, severity, businessImpact, recommendedSolution })),
    topProducts: data.topProducts,
    lowStockProducts: data.lowStockProducts,
    topCompanies: data.topCompanies,
    topBranches: data.topBranches,
  };
}

function deterministicAnswer(question: string, data: Awaited<ReturnType<typeof getSuperadminCommandCenterData>>) {
  const critical = data.notifications.filter((issue) => issue.severity === 'critical' || issue.severity === 'high');
  const revenue = data.businessMetrics.find((metric) => metric.key === 'monthly_revenue')?.displayValue ?? 'unavailable';
  const health = `${data.healthScore}%`;
  const readiness = `${data.readinessPercent}%`;
  const topRisk = critical[0]?.businessImpact ?? 'No critical command-center alert is currently active.';

  return [
    `Question: ${question}`,
    `Executive answer: system health is ${health}, production readiness is ${readiness}, and monthly revenue is ${revenue}.`,
    `Primary risk: ${topRisk}`,
    `Recommended action: review high-severity notifications first, then drill into revenue, queue, inventory, and audit widgets for owner assignment.`,
  ].join('\n');
}

export async function POST(request: NextRequest) {
  const auth = await requireSuperadminApi('superadmin_dashboard_ask');
  if (!auth.authorized) return auth.response;

  const body = await request.json().catch(() => ({}));
  const question = typeof body.question === 'string' ? body.question.trim() : '';
  if (question.length < 3) {
    return NextResponse.json({ error: 'Question must be at least 3 characters' }, { status: 400 });
  }

  try {
    const data = await getSuperadminCommandCenterData();
    const context = compactDashboardContext(data);
    const prompt = `You are TecBunny's Superadmin executive dashboard analyst. Answer the user's question using only the JSON dashboard context below. Be concise, operational, and include risks and next actions when relevant.\n\nDashboard JSON:\n${JSON.stringify(context)}\n\nQuestion: ${question}`;

    try {
      const answer = await generateGeminiText({ prompt, temperature: 0.2, maxOutputTokens: 520 });
      await persistAiQueryAudit(question, answer, 'gemini', auth.user?.email ?? 'superadmin-session');
      return NextResponse.json({ answer, provider: 'gemini', generatedAt: new Date().toISOString() });
    } catch (error) {
      logger.warn('superadmin_dashboard_ask.gemini_unavailable', { error });
      const answer = deterministicAnswer(question, data);
      await persistAiQueryAudit(question, answer, 'deterministic-fallback', auth.user?.email ?? 'superadmin-session');
      return NextResponse.json({
        answer,
        provider: 'deterministic-fallback',
        generatedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to answer dashboard question' },
      { status: 500 },
    );
  }
}