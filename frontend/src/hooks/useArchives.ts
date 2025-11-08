import { useQuery } from '@tanstack/react-query'
import { archivesApi } from '@/lib/api'

export function useArchives(params?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ['archives', params],
    queryFn: async () => {
      const response = await archivesApi.list(params)
      return response.data
    },
  })
}
