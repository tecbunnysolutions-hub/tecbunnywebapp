'use client';

import { useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';

import { useAnalytics } from '../hooks/use-analytics';
import type { EnterpriseEventCategory, TecBunnyApplication } from '../enterprise-analytics';

type EnterpriseAnalyticsAutoTrackerProps = {
  application: TecBunnyApplication | string;
  defaultModule?: string;
  dashboardPaths?: string[];
};

function moduleFromPath(pathname: string, fallback: string) {
  const segment = pathname.split('/').filter(Boolean)[0];
  return segment || fallback;
}

function isDashboardPath(pathname: string, dashboardPaths: string[]) {
  return dashboardPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function visibleLabel(element: Element) {
  const ariaLabel = element.getAttribute('aria-label');
  const dataLabel = element.getAttribute('data-analytics-label');
  const title = element.getAttribute('title');
  const text = element.textContent?.replace(/\s+/g, ' ').trim();
  return (dataLabel || ariaLabel || title || text || element.tagName.toLowerCase()).slice(0, 120);
}

function actionFromElement(element: Element) {
  const explicit = element.getAttribute('data-analytics-action');
  if (explicit) return explicit;

  const tag = element.tagName.toLowerCase();
  if (tag === 'a') return 'navigate';
  if (tag === 'button') return 'click_button';
  if (element.getAttribute('role') === 'menuitem') return 'select_menu_item';
  return 'interact';
}

export function EnterpriseAnalyticsAutoTracker({
  application,
  defaultModule = 'app',
  dashboardPaths = ['/dashboard', '/mgmt', '/analytics'],
}: EnterpriseAnalyticsAutoTrackerProps) {
  const pathname = usePathname();
  const { trackEvent } = useAnalytics();

  const eventPayload = useMemo(() => {
    const screen = pathname || '/';
    const dashboardView = isDashboardPath(screen, dashboardPaths);
    return {
      application,
      module: moduleFromPath(screen, defaultModule),
      screen,
      eventCategory: (dashboardView ? 'dashboard' : 'feature_usage') satisfies EnterpriseEventCategory,
      action: dashboardView ? 'view_dashboard' : 'view_page',
      dashboard: dashboardView ? screen : undefined,
      trigger: 'route_change',
      priority: 'medium',
    };
  }, [application, dashboardPaths, defaultModule, pathname]);

  useEffect(() => {
    if (!pathname) return;
    void trackEvent(eventPayload.action === 'view_dashboard' ? 'dashboard_view' : 'page_view', eventPayload);
  }, [eventPayload, pathname, trackEvent]);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;

    const handleClick = (event: MouseEvent) => {
      const target = event.target instanceof Element
        ? event.target.closest('a, button, [role="button"], [role="menuitem"], [data-analytics-action]')
        : null;
      if (!target) return;

      const action = actionFromElement(target);
      void trackEvent(action, {
        ...eventPayload,
        eventCategory: action === 'navigate' ? 'feature_usage' : 'user',
        action,
        entityType: target.tagName.toLowerCase(),
        entityId: target.getAttribute('href') || target.getAttribute('data-entity-id') || target.id || undefined,
        metadata: {
          label: visibleLabel(target),
          role: target.getAttribute('role'),
        },
      });
    };

    const handleSubmit = (event: SubmitEvent) => {
      const form = event.target instanceof HTMLFormElement ? event.target : null;
      if (!form) return;

      void trackEvent('submit_form', {
        ...eventPayload,
        eventCategory: 'user',
        action: 'submit_form',
        entityType: 'form',
        entityId: form.getAttribute('name') || form.id || undefined,
        metadata: {
          label: visibleLabel(form),
        },
      });
    };

    const handleSearchCommit = (event: Event) => {
      const input = event.target instanceof HTMLInputElement ? event.target : null;
      if (!input || input.type !== 'search') return;

      void trackEvent('search', {
        ...eventPayload,
        eventCategory: 'search',
        action: 'search',
        entityType: 'input',
        entityId: input.name || input.id || undefined,
        metadata: {
          label: visibleLabel(input),
          queryLength: input.value.length,
        },
      });
    };

    document.addEventListener('click', handleClick, true);
    document.addEventListener('submit', handleSubmit, true);
    document.addEventListener('change', handleSearchCommit, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('submit', handleSubmit, true);
      document.removeEventListener('change', handleSearchCommit, true);
    };
  }, [eventPayload, trackEvent]);

  return null;
}