/**
 * k6 load test for Payments Portal API.
 * Run: k6 run tests/load/clearing-load.js
 *
 * Targets:
 *  - p95 latency < 500ms at 1000 VUs
 *  - Error rate < 1%
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('error_rate');
const clearingLatency = new Trend('clearing_summary_latency');
const settlementLatency = new Trend('settlement_summary_latency');

export const options = {
  scenarios: {
    smoke: {
      executor: 'constant-vus',
      vus: 10,
      duration: '30s',
      tags: { scenario: 'smoke' },
    },
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 100 },
        { duration: '5m', target: 500 },
        { duration: '2m', target: 1000 },
        { duration: '3m', target: 1000 },
        { duration: '2m', target: 0 },
      ],
      gracefulRampDown: '30s',
      tags: { scenario: 'load' },
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    error_rate: ['rate<0.01'],
    clearing_summary_latency: ['p(95)<500'],
    settlement_summary_latency: ['p(95)<500'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost';
const JWT_TOKEN = __ENV.JWT_TOKEN || 'test-token';

const HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${JWT_TOKEN}`,
};

const DATE_PARAMS = 'dateFrom=2024-01-01&dateTo=2024-01-31';

export default function () {
  // Clearing summary
  const clearingRes = http.get(
    `${BASE_URL}/api/clearing/summary?${DATE_PARAMS}`,
    { headers: HEADERS, tags: { endpoint: 'clearing-summary' } }
  );
  clearingLatency.add(clearingRes.timings.duration);
  check(clearingRes, {
    'clearing summary status 200': (r) => r.status === 200,
    'clearing has total_transactions': (r) => r.json('total_transactions') !== undefined,
  });
  errorRate.add(clearingRes.status !== 200);

  // Settlement summary
  const settlementRes = http.get(
    `${BASE_URL}/api/settlement/summary?${DATE_PARAMS}`,
    { headers: HEADERS, tags: { endpoint: 'settlement-summary' } }
  );
  settlementLatency.add(settlementRes.timings.duration);
  check(settlementRes, {
    'settlement summary status 200': (r) => r.status === 200,
  });
  errorRate.add(settlementRes.status !== 200);

  // Fraud summary
  const fraudRes = http.get(
    `${BASE_URL}/api/fraud/summary?${DATE_PARAMS}`,
    { headers: HEADERS, tags: { endpoint: 'fraud-summary' } }
  );
  check(fraudRes, { 'fraud summary status 200': (r) => r.status === 200 });

  // Executive dashboard (multiple parallel requests)
  const responses = http.batch([
    ['GET', `${BASE_URL}/api/clearing/daily-trend?${DATE_PARAMS}`, null, { headers: HEADERS }],
    ['GET', `${BASE_URL}/api/compliance/score`, null, { headers: HEADERS }],
    ['GET', `${BASE_URL}/api/cards/summary?${DATE_PARAMS}`, null, { headers: HEADERS }],
  ]);

  for (const res of responses) {
    errorRate.add(res.status !== 200);
  }

  sleep(1);
}

export function handleSummary(data) {
  return {
    'stdout': JSON.stringify({
      thresholds_passed: Object.entries(data.metrics).every(([, m]) => m.thresholds?.ok !== false),
      p95_latency_ms: data.metrics['http_req_duration']?.values?.['p(95)'],
      error_rate_pct: (data.metrics['error_rate']?.values?.rate * 100).toFixed(2) + '%',
      total_requests: data.metrics['http_reqs']?.values?.count,
      vus_max: data.metrics['vus_max']?.values?.max,
    }, null, 2),
  };
}
