import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsApi, type Transaction, type TransactionItem } from '@/lib/api';
import { toast } from 'sonner';

export function useTransactions(params?: { date?: string; registerId?: string }) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: async () => {
      const response = await transactionsApi.list(params);
      return response.data;
    },
  });
}

export function useTransaction(uuid: string) {
  return useQuery({
    queryKey: ['transaction', uuid],
    queryFn: async () => {
      const response = await transactionsApi.getOne(uuid);
      return response.data;
    },
    enabled: !!uuid,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      items: TransactionItem[];
      paymentMethod: string;
      customerEmail?: string;
      customerName?: string;
    }) => {
      const response = await transactionsApi.create(data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Transaction enregistrée avec succès', {
        description: `Ticket N° ${data.receiptNumber}`,
      });
    },
    onError: (error: any) => {
      toast.error('Erreur lors de la transaction', {
        description: error.response?.data?.message || error.message,
      });
    },
  });
}

export function useVerifyHashChain() {
  return useQuery({
    queryKey: ['hash-verification'],
    queryFn: async () => {
      const response = await transactionsApi.verifyHashChain();
      return response.data;
    },
    refetchInterval: 5 * 60 * 1000, // Vérifier toutes les 5 minutes
  });
}
