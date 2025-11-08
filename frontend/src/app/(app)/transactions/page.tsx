'use client'

import { useState } from 'react'
import { Search, Filter, Download, Eye, Calendar, Receipt } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useTransactions } from '@/hooks/useTransactions'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function TransactionsPage() {
  const [search, setSearch] = useState('')

  const { data: transactions = [], isLoading } = useTransactions()

  const filteredTransactions = transactions.filter((t) =>
    t.receiptNumber?.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    today: transactions.length,
    totalAmount: transactions.reduce((acc, t) => acc + t.totalTtc, 0),
    averageTicket:
      transactions.length > 0
        ? transactions.reduce((acc, t) => acc + t.totalTtc, 0) / transactions.length
        : 0,
    cbPayments: transactions.filter((t) => t.paymentMethod === 'card').length,
    cashPayments: transactions.filter((t) => t.paymentMethod === 'cash').length,
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    )
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
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
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
            <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
            <p className="text-xs text-muted-foreground">chiffre d'affaires</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket moyen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.averageTicket)}</div>
            <p className="text-xs text-muted-foreground">par transaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paiements CB</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.today > 0 ? ((stats.cbPayments / stats.today) * 100).toFixed(0) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.cbPayments} CB / {stats.cashPayments} Espèces
            </p>
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
                  <th className="px-4 py-3 text-center text-sm font-medium">Articles</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Total HT</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">TVA</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Total TTC</th>
                  <th className="px-4 py-3 text-center text-sm font-medium">Paiement</th>
                  <th className="px-4 py-3 text-center text-sm font-medium">Hash NF525</th>
                  <th className="px-4 py-3 text-center text-sm font-medium">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                      Aucune transaction trouvée
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-primary">
                          {transaction.receiptNumber}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {formatDate(transaction.transactionDate)}
                      </td>
                      <td className="px-4 py-3 text-center text-sm">
                        {Array.isArray(transaction.items) ? transaction.items.length : 0}
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        {formatCurrency(transaction.totalHt)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        {formatCurrency(transaction.totalVat)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(transaction.totalTtc)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="outline" className="capitalize">
                          {transaction.paymentMethod === 'card' ? 'CB' : 'Espèces'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <code className="text-xs text-muted-foreground">
                          {transaction.currentHash?.substring(0, 8)}...
                        </code>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge
                          variant={
                            transaction.status === 'completed'
                              ? 'default'
                              : transaction.status === 'cancelled'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {transaction.status === 'completed'
                            ? 'Complété'
                            : transaction.status === 'cancelled'
                            ? 'Annulé'
                            : 'En attente'}
                        </Badge>
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
  )
}
