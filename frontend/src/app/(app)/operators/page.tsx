'use client'

import { Plus, Edit, Trash2, Users, UserCheck, UserX } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function OperatorsPage() {
  const operators = [
    {
      id: 1,
      name: 'Marie Dupont',
      email: 'marie.dupont@felxpos.fr',
      role: 'Manager',
      active: true,
      lastActivity: '2025-01-15 15:30',
      transactions: 145,
    },
    {
      id: 2,
      name: 'Jean Martin',
      email: 'jean.martin@felxpos.fr',
      role: 'Caissier',
      active: true,
      lastActivity: '2025-01-15 14:45',
      transactions: 89,
    },
    {
      id: 3,
      name: 'Sophie Bernard',
      email: 'sophie.bernard@felxpos.fr',
      role: 'Caissier',
      active: false,
      lastActivity: '2025-01-10 18:00',
      transactions: 234,
    },
  ]

  const stats = {
    total: operators.length,
    active: operators.filter((o) => o.active).length,
    managers: operators.filter((o) => o.role === 'Manager').length,
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Opérateurs</h1>
          <p className="text-muted-foreground">Gérez les employés et leurs accès</p>
        </div>
        <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
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
                  <th className="px-4 py-3 text-center text-sm font-medium">Transactions</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Dernière activité</th>
                  <th className="px-4 py-3 text-center text-sm font-medium">Statut</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {operators.map((operator) => (
                  <tr key={operator.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <div className="font-medium">{operator.name}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {operator.email}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{operator.role}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      {operator.transactions}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {operator.lastActivity}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={operator.active ? 'default' : 'secondary'}>
                        {operator.active ? 'Actif' : 'Inactif'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button className="rounded p-1 hover:bg-accent">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="rounded p-1 hover:bg-accent text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
