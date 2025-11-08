import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { closuresApi } from '@/lib/api';
import { toast } from 'sonner';

export function useClosures() {
  return useQuery({
    queryKey: ['closures'],
    queryFn: async () => {
      const response = await closuresApi.list();
      return response.data;
    },
  });
}

export function useClosure(id: string) {
  return useQuery({
    queryKey: ['closure', id],
    queryFn: async () => {
      const response = await closuresApi.getOne(id);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateClosure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { date: string; registerId: string }) => {
      const response = await closuresApi.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['closures'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Clôture journalière effectuée', {
        description: 'Les données ont été archivées de manière sécurisée',
      });
    },
    onError: (error: any) => {
      toast.error('Erreur lors de la clôture', {
        description: error.response?.data?.message || error.message,
      });
    },
  });
}
