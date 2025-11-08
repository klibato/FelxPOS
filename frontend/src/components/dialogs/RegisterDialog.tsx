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
import { useCreateRegister, useUpdateRegister } from '@/hooks/useRegisters'
import type { CashRegister } from '@/lib/api'

const registerSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  location: z.string().min(1, 'Emplacement requis'),
  isActive: z.boolean().default(true),
})

type RegisterFormData = z.infer<typeof registerSchema>

interface RegisterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  register_?: CashRegister | null
}

export function RegisterDialog({ open, onOpenChange, register_ }: RegisterDialogProps) {
  const createRegister = useCreateRegister()
  const updateRegister = useUpdateRegister()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      isActive: true,
    },
  })

  useEffect(() => {
    if (register_) {
      reset({
        name: register_.name,
        location: register_.location,
        isActive: register_.isActive,
      })
    } else {
      reset({
        name: '',
        location: '',
        isActive: true,
      })
    }
  }, [register_, reset])

  const onSubmit = async (data: RegisterFormData) => {
    try {
      if (register_) {
        await updateRegister.mutateAsync({ id: register_.id, data })
      } else {
        await createRegister.mutateAsync(data)
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
            {register_ ? 'Modifier la caisse' : 'Nouvelle caisse'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de la caisse *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Caisse 1"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Emplacement *</Label>
            <Input
              id="location"
              {...register('location')}
              placeholder="Salle principale"
            />
            {errors.location && (
              <p className="text-sm text-destructive">{errors.location.message}</p>
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
              Caisse active
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
              disabled={createRegister.isPending || updateRegister.isPending}
              className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {createRegister.isPending || updateRegister.isPending
                ? 'Enregistrement...'
                : register_
                ? 'Modifier'
                : 'Créer'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
