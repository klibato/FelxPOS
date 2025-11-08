import { useQuery } from '@tanstack/react-query';
import { statsApi } from '@/lib/api';

export function useDailyStats(params?: { date?: string }) {
  return useQuery({
    queryKey: ['stats', 'daily', params],
    queryFn: async () => {
      const response = await statsApi.daily(params);
      return response.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
