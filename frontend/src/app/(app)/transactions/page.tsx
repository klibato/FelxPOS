'use client'

import { useState } from 'react'
import { Search, Filter, Download, Eye, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default function TransactionsPage() {
  const [search, setSearch] = useState('')

  // Mock data
  const transactions = [
    {
      id: 1,
      receiptNumber: 'T-2025-001234',
      date: '2025-01-15 14:30:25',
      cashRegister: 'Caisse 1',
      operator: 'Marie Dupont',
      items: 3,
      totalHt: 15.45,
      totalVat: 1.85,
      totalTtc: 17.30,
      paymentMethod: 'CB',
      hash: 'a3f5...8c2d',
    },
    {
      id: 2,
      receiptNumber: 'T-2025-001235',
      date: '2025-01-15 14:35:10',
      cashRegister: 'Caisse 1',
      operator: 'Marie Dupont',
      items: 1,
      totalHt: 2.27,
      totalVat: 0.23,
      totalTtc: 2.50,
      paymentMethod: 'Espèces',
      hash: 'b7d9...1f4a',
    },
    {
      id: 3,
      receiptNumber: 'T-2025-001236',
      date: '2025-01-15 14:42:55',
      cashRegister: 'Caisse 2',
      operator: 'Jean Martin',
      items: 5,
      totalHt: 28.18,
      totalVat: 3.42,
      totalTtc: 31.60,
      paymentMethod: 'CB',
      hash: 'c9e2...3b7f',
    },
  ]

  const stats = {
    today: transactions.length,
    totalAmount: transactions.reduce((acc, t) => acc + t.totalTtc, 0),
    averageTicket: transactions.reduce((acc, t) => acc + t.totalTtc, 0) / transactions.length,
    cbPayments: transactions.filter((t) => t.paymentMethod === 'CB').length,
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">
            Historique des ventes et tickets
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm hover:bg-accent">
          <Download className="h-4 w-4" />
          Exporter
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions du jour</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today}</div>
            <p className="text-xs text-muted-foreground">tickets émis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Montant total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAmount.toFixed(2)} €</div>
            <p className="text-xs text-muted-foreground">chiffre d'affaires</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket moyen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageTicket.toFixed(2)} €</div>
            <p className="text-xs text-muted-foreground">par transaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paiements CB</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((stats.cbPayments / stats.today) * 100).toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">{stats.cbPayments} transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher par numéro de ticket..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <button className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm hover:bg-accent">
              <Calendar className="h-4 w-4" />
              Période
            </button>
            <button className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm hover:bg-accent">
              <Filter className="h-4 w-4" />
              Filtres
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">N° Ticket</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Date/Heure</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Caisse</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Opérateur</th>
                  <th className="px-4 py-3 text-center text-sm font-medium">Articles</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Total TTC</th>
                  <th className="px-4 py-3 text-center text-sm font-medium">Paiement</th>
                  <th className="px-4 py-3 text-center text-sm font-medium">Hash NF525</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-primary">{transaction.receiptNumber}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {transaction.date}
                    </td>
                    <td className="px-4 py-3 text-sm">{transaction.cashRegister}</td>
                    <td className="px-4 py-3 text-sm">{transaction.operator}</td>
                    <td className="px-4 py-3 text-center text-sm">
                      {transaction.items}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {transaction.totalTtc.toFixed(2)} €
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="outline">{transaction.paymentMethod}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <code className="text-xs text-muted-foreground">{transaction.hash}</code>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button className="rounded p-1 hover:bg-accent" title="Voir détails">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="rounded p-1 hover:bg-accent" title="Télécharger ticket">
                          <Download className="h-4 w-4" />
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
