import {
  apiRequest,
} from '@/src/services/api';

import type {
  AnalyticsSummary,
} from '@/src/types/analytics';

export async function fetchAnalyticsSummary() {
  return apiRequest<AnalyticsSummary>(
    '/analytics/summary',
    {
      authenticated: true,
    },
  );
}
