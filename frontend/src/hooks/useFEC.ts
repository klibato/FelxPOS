import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fecApi, type FECExport } from '@/lib/api'
import { toast } from 'sonner'

export function useFECExports() {
  return useQuery({
    queryKey: ['fec-exports'],
    queryFn: async () => {
      const response = await fecApi.list()
      return response.data
    },
  })
}

export function useGenerateFEC() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { startDate: string; endDate: string; year: number }) => {
      const response = await fecApi.generate(data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fec-exports'] })
      toast.success('Export FEC généré avec succès')
    },
    onError: (error: any) => {
      toast.error('Erreur lors de la génération', {
        description: error.response?.data?.message || error.message,
      })
    },
  })
}
