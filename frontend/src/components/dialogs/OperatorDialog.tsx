'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateOperator, useUpdateOperator } from '@/hooks/useOperators'
import type { Operator } from '@/lib/api'

const operatorSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  email: z.string().email('Email invalide'),
  role: z.enum(['manager', 'cashier', 'admin']),
  isActive: z.boolean().default(true),
})

type OperatorFormData = z.infer<typeof operatorSchema>

interface OperatorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  operator?: Operator | null
}

export function OperatorDialog({ open, onOpenChange, operator }: OperatorDialogProps) {
  const createOperator = useCreateOperator()
  const updateOperator = useUpdateOperator()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OperatorFormData>({
    resolver: zodResolver(operatorSchema),
    defaultValues: {
      isActive: true,
      role: 'cashier',
    },
  })

  const role = watch('role')

  useEffect(() => {
    if (operator) {
      reset({
        name: operator.name,
        email: operator.email,
        role: operator.role,
        isActive: operator.isActive,
      })
    } else {
      reset({
        name: '',
        email: '',
        role: 'cashier',
        isActive: true,
      })
    }
  }, [operator, reset])

  const onSubmit = async (data: OperatorFormData) => {
    try {
      if (operator) {
        await updateOperator.mutateAsync({ id: operator.id, data })
      } else {
        await createOperator.mutateAsync(data)
      }
      onOpenChange(false)
      reset()
    } catch (error) {
      // Error handled by hooks
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {operator ? 'Modifier l\'opérateur' : 'Nouvel opérateur'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom complet *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Marie Dupont"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="marie.dupont@felxpos.fr"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rôle *</Label>
            <Select
              value={role}
              onValueChange={(value) => setValue('role', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cashier">Caissier</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Administrateur</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-destructive">{errors.role.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              {...register('isActive')}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="isActive" className="font-normal">
              Compte actif
            </Label>
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={createOperator.isPending || updateOperator.isPending}
              className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {createOperator.isPending || updateOperator.isPending
                ? 'Enregistrement...'
                : operator
                ? 'Modifier'
                : 'Créer'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
