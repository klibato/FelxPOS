import { useQuery } from '@tanstack/react-query';
import { auditApi } from '@/lib/api';

export function useAuditAnomalies() {
  return useQuery({
    queryKey: ['audit', 'anomalies'],
    queryFn: async () => {
      const response = await auditApi.getAnomalies();
      return response.data;
    },
    refetchInterval: 5 * 60 * 1000, // Check every 5 minutes
  });
}
