import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { registersApi, type CashRegister } from '@/lib/api'
import { toast } from 'sonner'

export function useRegisters() {
  return useQuery({
    queryKey: ['registers'],
    queryFn: async () => {
      const response = await registersApi.list()
      return response.data
    },
  })
}

export function useCreateRegister() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<CashRegister>) => {
      const response = await registersApi.create(data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registers'] })
      toast.success('Caisse créée avec succès')
    },
    onError: (error: any) => {
      toast.error('Erreur lors de la création', {
        description: error.response?.data?.message || error.message,
      })
    },
  })
}

export function useUpdateRegister() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CashRegister> }) => {
      const response = await registersApi.update(id, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registers'] })
      toast.success('Caisse modifiée avec succès')
    },
    onError: (error: any) => {
      toast.error('Erreur lors de la modification', {
        description: error.response?.data?.message || error.message,
      })
    },
  })
}

export function useDeleteRegister() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await registersApi.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registers'] })
      toast.success('Caisse supprimée avec succès')
    },
    onError: (error: any) => {
      toast.error('Erreur lors de la suppression', {
        description: error.response?.data?.message || error.message,
      })
    },
  })
}
