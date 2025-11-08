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
import { useCreateProduct, useUpdateProduct } from '@/hooks/useProducts'
import type { Product } from '@/lib/api'

const productSchema = z.object({
  sku: z.string().min(1, 'SKU requis'),
  name: z.string().min(1, 'Nom requis'),
  price: z.number().min(0, 'Prix doit être positif'),
  vatRate: z.string(),
  category: z.string().min(1, 'Catégorie requise'),
  isActive: z.boolean().default(true),
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
}

export function ProductDialog({ open, onOpenChange, product }: ProductDialogProps) {
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      isActive: true,
    },
  })

  const vatRate = watch('vatRate')

  useEffect(() => {
    if (product) {
      reset({
        sku: product.sku,
        name: product.name,
        price: product.price,
        vatRate: product.vatRate,
        category: product.category,
        isActive: product.isActive,
      })
    } else {
      reset({
        sku: '',
        name: '',
        price: 0,
        vatRate: '20',
        category: '',
        isActive: true,
      })
    }
  }, [product, reset])

  const onSubmit = async (data: ProductFormData) => {
    try {
      if (product) {
        await updateProduct.mutateAsync({ id: product.id, data })
      } else {
        await createProduct.mutateAsync(data)
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
            {product ? 'Modifier le produit' : 'Nouveau produit'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                {...register('sku')}
                placeholder="PROD-001"
              />
              {errors.sku && (
                <p className="text-sm text-destructive">{errors.sku.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Catégorie *</Label>
              <Input
                id="category"
                {...register('category')}
                placeholder="Boissons"
              />
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nom du produit *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Café Expresso"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Prix HT (€) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...register('price', { valueAsNumber: true })}
                placeholder="2.50"
              />
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="vatRate">Taux de TVA *</Label>
              <Select
                value={vatRate}
                onValueChange={(value) => setValue('vatRate', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un taux" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20">20% - Taux normal</SelectItem>
                  <SelectItem value="10">10% - Taux intermédiaire</SelectItem>
                  <SelectItem value="5.5">5,5% - Taux réduit</SelectItem>
                  <SelectItem value="2.1">2,1% - Taux super réduit</SelectItem>
                </SelectContent>
              </Select>
              {errors.vatRate && (
                <p className="text-sm text-destructive">{errors.vatRate.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              {...register('isActive')}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="isActive" className="font-normal">
              Produit actif
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
              disabled={createProduct.isPending || updateProduct.isPending}
              className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {createProduct.isPending || updateProduct.isPending
                ? 'Enregistrement...'
                : product
                ? 'Modifier'
                : 'Créer'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
