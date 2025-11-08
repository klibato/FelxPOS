import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { operatorsApi, type Operator } from '@/lib/api'
import { toast } from 'sonner'

export function useOperators() {
  return useQuery({
    queryKey: ['operators'],
    queryFn: async () => {
      const response = await operatorsApi.list()
      return response.data
    },
  })
}

export function useCreateOperator() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<Operator>) => {
      const response = await operatorsApi.create(data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operators'] })
      toast.success('Opérateur créé avec succès')
    },
    onError: (error: any) => {
      toast.error('Erreur lors de la création', {
        description: error.response?.data?.message || error.message,
      })
    },
  })
}

export function useUpdateOperator() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Operator> }) => {
      const response = await operatorsApi.update(id, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operators'] })
      toast.success('Opérateur modifié avec succès')
    },
    onError: (error: any) => {
      toast.error('Erreur lors de la modification', {
        description: error.response?.data?.message || error.message,
      })
    },
  })
}

export function useDeleteOperator() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await operatorsApi.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operators'] })
      toast.success('Opérateur supprimé avec succès')
    },
    onError: (error: any) => {
      toast.error('Erreur lors de la suppression', {
        description: error.response?.data?.message || error.message,
      })
    },
  })
}
