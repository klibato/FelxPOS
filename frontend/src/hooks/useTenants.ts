import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { tenantsApi, type Tenant } from '@/lib/api'
import { toast } from 'sonner'

export function useTenant() {
  return useQuery({
    queryKey: ['tenant'],
    queryFn: async () => {
      const response = await tenantsApi.getCurrent()
      return response.data
    },
  })
}

export function useUpdateTenant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<Tenant>) => {
      const response = await tenantsApi.update(data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant'] })
      toast.success('Paramètres mis à jour avec succès')
    },
    onError: (error: any) => {
      toast.error('Erreur lors de la mise à jour', {
        description: error.response?.data?.message || error.message,
      })
    },
  })
}
