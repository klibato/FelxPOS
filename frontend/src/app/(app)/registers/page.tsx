'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, CreditCard, Circle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRegisters, useDeleteRegister } from '@/hooks/useRegisters'
import { RegisterDialog } from '@/components/dialogs/RegisterDialog'
import type { CashRegister } from '@/lib/api'
import { formatDate } from '@/lib/utils'

export default function RegistersPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedRegister, setSelectedRegister] = useState<CashRegister | undefined>()

  const { data: registers = [], isLoading } = useRegisters()
  const deleteRegister = useDeleteRegister()

  const stats = {
    total: registers.length,
    active: registers.filter((r) => r.isActive).length,
  }

  const handleEdit = (register: CashRegister) => {
    setSelectedRegister(register)
    setDialogOpen(true)
  }

  const handleDelete = async (register: CashRegister) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${register.name}" ?`)) return
    await deleteRegister.mutateAsync(register.id)
  }

  const handleNew = () => {
    setSelectedRegister(undefined)
    setDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    )
  }

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Caisses Enregistreuses</h1>
            <p className="text-muted-foreground">Gérez vos points de vente</p>
          </div>
          <button
            onClick={handleNew}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Nouvelle caisse
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total caisses</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actives</CardTitle>
              <Circle className="h-4 w-4 text-green-600 fill-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {registers.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              Aucune caisse enregistreuse trouvée
            </div>
          ) : (
            registers.map((register) => (
              <Card key={register.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {register.name}
                        <Circle
                          className={`h-2 w-2 ${
                            register.isActive
                              ? 'text-green-600 fill-green-600'
                              : 'text-gray-400 fill-gray-400'
                          }`}
                        />
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {register.location}
                      </p>
                    </div>
                    <Badge variant={register.isActive ? 'default' : 'secondary'}>
                      {register.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Dernière activité</span>
                    <span className="text-xs">
                      {register.lastActivity ? formatDate(register.lastActivity) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleEdit(register)}
                      className="flex-1 flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-accent"
                    >
                      <Edit className="h-4 w-4" />
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(register)}
                      className="rounded-md border px-3 py-2 text-sm hover:bg-accent text-destructive"
                      disabled={deleteRegister.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <RegisterDialog
        register={selectedRegister}
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setSelectedRegister(undefined)
        }}
      />
    </>
  )
}
