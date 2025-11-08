'use client'

import { Calendar, CheckCircle2, AlertCircle, Download, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function ClosuresPage() {
  const closures = [
    {
      id: 1,
      date: '2025-01-15',
      cashRegister: 'Caisse 1',
      transactions: 145,
      totalHt: 1245.67,
      totalVat: 145.23,
      totalTtc: 1390.90,
      status: 'completed',
      archived: true,
      hash: 'f4a3...9c1d',
      archiveUrl: 'https://r2.cloudflarestorage.com/...',
    },
    {
      id: 2,
      date: '2025-01-14',
      cashRegister: 'Caisse 1',
      transactions: 132,
      totalHt: 1156.78,
      totalVat: 135.89,
      totalTtc: 1292.67,
      status: 'completed',
      archived: true,
      hash: 'e7b2...4f8a',
      archiveUrl: 'https://r2.cloudflarestorage.com/...',
    },
    {
      id: 3,
      date: '2025-01-13',
      cashRegister: 'Caisse 1',
      transactions: 98,
      totalHt: 876.45,
      totalVat: 103.12,
      totalTtc: 979.57,
      status: 'completed',
      archived: false,
      hash: 'd5c1...2a7b',
      archiveUrl: null,
    },
  ]

  const stats = {
    total: closures.length,
    archived: closures.filter((c) => c.archived).length,
    avgTransactions: Math.round(closures.reduce((acc, c) => acc + c.transactions, 0) / closures.length),
    totalRevenue: closures.reduce((acc, c) => acc + c.totalTtc, 0),
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clôtures Journalières</h1>
          <p className="text-muted-foreground">
            Clôtures de caisse conformes NF525
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Calendar className="h-4 w-4" />
          Nouvelle clôture
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clôtures totales</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">périodes clôturées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Archivées</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.archived}</div>
            <p className="text-xs text-muted-foreground">stockées sur R2</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Moy. transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgTransactions}</div>
            <p className="text-xs text-muted-foreground">par jour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CA total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)} €</div>
            <p className="text-xs text-muted-foreground">sur {stats.total} jours</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historique des Clôtures</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Caisse</th>
                  <th className="px-4 py-3 text-center text-sm font-medium">Transactions</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Total HT</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">TVA</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Total TTC</th>
                  <th className="px-4 py-3 text-center text-sm font-medium">Hash NF525</th>
                  <th className="px-4 py-3 text-center text-sm font-medium">Archivage</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {closures.map((closure) => (
                  <tr key={closure.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <div className="font-medium">{closure.date}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">{closure.cashRegister}</td>
                    <td className="px-4 py-3 text-center text-sm">
                      {closure.transactions}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      {closure.totalHt.toFixed(2)} €
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      {closure.totalVat.toFixed(2)} €
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {closure.totalTtc.toFixed(2)} €
                    </td>
                    <td className="px-4 py-3 text-center">
                      <code className="text-xs text-muted-foreground">{closure.hash}</code>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {closure.archived ? (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Archivé
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <AlertCircle className="h-3 w-3" />
                          En attente
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button className="rounded p-1 hover:bg-accent" title="Voir détails">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="rounded p-1 hover:bg-accent" title="Télécharger rapport">
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
