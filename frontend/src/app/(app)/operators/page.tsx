'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, Users, UserCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useOperators, useDeleteOperator } from '@/hooks/useOperators'
import { OperatorDialog } from '@/components/dialogs/OperatorDialog'
import type { Operator } from '@/lib/api'

export default function OperatorsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedOperator, setSelectedOperator] = useState<Operator | undefined>()

  const { data: operators = [], isLoading } = useOperators()
  const deleteOperator = useDeleteOperator()

  const stats = {
    total: operators.length,
    active: operators.filter((o) => o.isActive).length,
    managers: operators.filter((o) => o.role === 'manager').length,
  }

  const handleEdit = (operator: Operator) => {
    setSelectedOperator(operator)
    setDialogOpen(true)
  }

  const handleDelete = async (operator: Operator) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${operator.name}" ?`)) return
    await deleteOperator.mutateAsync(operator.id)
  }

  const handleNew = () => {
    setSelectedOperator(undefined)
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
            <h1 className="text-3xl font-bold">Opérateurs</h1>
            <p className="text-muted-foreground">Gérez les employés et leurs accès</p>
          </div>
          <button
            onClick={handleNew}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Nouvel opérateur
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total opérateurs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actifs</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Managers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.managers}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Opérateur</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Rôle</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Dernière activité</th>
                    <th className="px-4 py-3 text-center text-sm font-medium">Statut</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {operators.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                        Aucun opérateur trouvé
                      </td>
                    </tr>
                  ) : (
                    operators.map((operator) => (
                      <tr key={operator.id} className="hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <div className="font-medium">{operator.name}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {operator.email}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="capitalize">
                            {operator.role}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {operator.lastActivity || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={operator.isActive ? 'default' : 'secondary'}>
                            {operator.isActive ? 'Actif' : 'Inactif'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(operator)}
                              className="rounded p-1 hover:bg-accent"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(operator)}
                              className="rounded p-1 hover:bg-accent text-destructive"
                              disabled={deleteOperator.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <OperatorDialog
        operator={selectedOperator}
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setSelectedOperator(undefined)
        }}
      />
    </>
  )
}
