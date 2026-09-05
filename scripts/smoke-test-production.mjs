#!/usr/bin/env node

/**
 * Production Smoke Test Script
 * Verifies that key production endpoints are reachable (200 OK)
 * and confirms that no outdated marketing claims or internal terminology are present.
 */

const TARGET_HOST = process.env.SMOKE_TEST_HOST || 'https://www.tecbunny.com';

const ROUTES_TO_TEST = [
  {
    path: '/',
    expectedText: ['Secure operations.'],
    forbiddenText: ['Response Guarantee Backed'],
  },
  {
    path: '/products',
    expectedText: ['Products'],
    forbiddenText: ['Root Console'],
  },
  {
    path: '/services',
    expectedText: ['Services'],
    forbiddenText: ['Root Console'],
  },
  {
    path: '/services/smart-infrastructure',
    expectedText: [
      'Next-Gen Smart Infrastructure',
      'enterprise solutions team',
      'eligible enterprise SLA plans',
    ],
    forbiddenText: [
      'zero blind spots',
      'zero dropped connections',
      'Root Console',
    ],
  },
  {
    path: '/services/network-infrastructure',
    expectedText: ['enterprise solutions team'],
    forbiddenText: ['Root Console'],
  },
  {
    path: '/services/physical-security',
    expectedText: ['enterprise solutions team'],
    forbiddenText: ['Root Console'],
  },
];

async function runSmokeTests() {
  console.log(`Starting production smoke tests against ${TARGET_HOST}...\n`);
  let failed = 0;

  for (const route of ROUTES_TO_TEST) {
    const url = `${TARGET_HOST}${route.path}`;
    try {
      const startTime = Date.now();
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'TecBunny-Production-SmokeTest/1.0',
        },
      });
      const duration = Date.now() - startTime;

      if (!response.ok) {
        console.error(`❌ [FAIL] ${route.path} returned status ${response.status} (${duration}ms)`);
        failed++;
        continue;
      }

      const html = await response.text();
      let routeFailed = false;

      if (route.expectedText) {
        for (const expected of route.expectedText) {
          if (!html.includes(expected)) {
            console.error(`❌ [FAIL] ${route.path} missing expected string: "${expected}"`);
            routeFailed = true;
          }
        }
      }

      if (route.forbiddenText) {
        for (const forbidden of route.forbiddenText) {
          if (html.includes(forbidden)) {
            console.error(`❌ [FAIL] ${route.path} contains forbidden string: "${forbidden}"`);
            routeFailed = true;
          }
        }
      }

      if (routeFailed) {
        failed++;
      } else {
        console.log(`✅ [PASS] ${route.path} (status: ${response.status}, ${duration}ms)`);
      }
    } catch (error) {
      console.error(`❌ [ERROR] ${route.path}: ${error instanceof Error ? error.message : String(error)}`);
      failed++;
    }
  }

  console.log(`\nSmoke tests finished: ${ROUTES_TO_TEST.length - failed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runSmokeTests();
