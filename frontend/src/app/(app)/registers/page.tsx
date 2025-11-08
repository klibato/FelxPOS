'use client'

import { Plus, Edit, Trash2, CreditCard, Circle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function RegistersPage() {
  const registers = [
    {
      id: 1,
      name: 'Caisse 1',
      location: 'Salle principale',
      status: 'online',
      lastActivity: '2025-01-15 15:45',
      todayTransactions: 145,
      todayRevenue: 1390.90,
    },
    {
      id: 2,
      name: 'Caisse 2',
      location: 'Drive',
      status: 'online',
      lastActivity: '2025-01-15 15:42',
      todayTransactions: 89,
      todayRevenue: 756.45,
    },
    {
      id: 3,
      name: 'Caisse 3',
      location: 'Terrasse',
      status: 'offline',
      lastActivity: '2025-01-14 18:00',
      todayTransactions: 0,
      todayRevenue: 0,
    },
  ]

  const stats = {
    total: registers.length,
    online: registers.filter((r) => r.status === 'online').length,
    totalTransactions: registers.reduce((acc, r) => acc + r.todayTransactions, 0),
    totalRevenue: registers.reduce((acc, r) => acc + r.todayRevenue, 0),
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Caisses Enregistreuses</h1>
          <p className="text-muted-foreground">Gérez vos points de vente</p>
        </div>
        <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Nouvelle caisse
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
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
            <CardTitle className="text-sm font-medium">En ligne</CardTitle>
            <Circle className="h-4 w-4 text-green-600 fill-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.online}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions du jour</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CA du jour</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)} €</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {registers.map((register) => (
          <Card key={register.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {register.name}
                    <Circle
                      className={`h-2 w-2 ${
                        register.status === 'online'
                          ? 'text-green-600 fill-green-600'
                          : 'text-gray-400 fill-gray-400'
                      }`}
                    />
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {register.location}
                  </p>
                </div>
                <Badge variant={register.status === 'online' ? 'default' : 'secondary'}>
                  {register.status === 'online' ? 'En ligne' : 'Hors ligne'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Transactions</span>
                <span className="font-medium">{register.todayTransactions}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">CA du jour</span>
                <span className="font-medium">{register.todayRevenue.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Dernière activité</span>
                <span className="text-xs">{register.lastActivity}</span>
              </div>
              <div className="flex gap-2 pt-2">
                <button className="flex-1 flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-accent">
                  <Edit className="h-4 w-4" />
                  Modifier
                </button>
                <button className="rounded-md border px-3 py-2 text-sm hover:bg-accent text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
