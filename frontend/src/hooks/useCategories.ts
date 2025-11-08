import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { categoriesApi, type Category } from '@/lib/api'
import { toast } from 'sonner'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await categoriesApi.list()
      return response.data
    },
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<Category>) => {
      const response = await categoriesApi.create(data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Catégorie créée avec succès')
    },
    onError: (error: any) => {
      toast.error('Erreur lors de la création', {
        description: error.response?.data?.message || error.message,
      })
    },
  })
}
