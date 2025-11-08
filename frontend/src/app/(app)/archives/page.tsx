'use client'

import { Archive, Download, Search, Calendar, HardDrive } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default function ArchivesPage() {
  const archives = [
    {
      id: 1,
      date: '2025-01-15',
      type: 'Clôture journalière',
      size: '2.4 MB',
      transactions: 145,
      url: 'https://ce3bcbdd9e0e69cc83d25a9d5272b518.r2.cloudflarestorage.com/test-flex/closure-2025-01-15.json',
      hash: 'f4a3...9c1d',
    },
    {
      id: 2,
      date: '2025-01-14',
      type: 'Clôture journalière',
      size: '2.1 MB',
      transactions: 132,
      url: 'https://ce3bcbdd9e0e69cc83d25a9d5272b518.r2.cloudflarestorage.com/test-flex/closure-2025-01-14.json',
      hash: 'e7b2...4f8a',
    },
    {
      id: 3,
      date: '2025-01-13',
      type: 'Clôture journalière',
      size: '1.8 MB',
      transactions: 98,
      url: 'https://ce3bcbdd9e0e69cc83d25a9d5272b518.r2.cloudflarestorage.com/test-flex/closure-2025-01-13.json',
      hash: 'd5c1...2a7b',
    },
  ]

  const stats = {
    total: archives.length,
    totalSize: archives.reduce((acc, a) => acc + parseFloat(a.size), 0),
    retention: 6,
    compliance: 100,
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Archives</h1>
        <p className="text-muted-foreground">
          Stockage sécurisé sur Cloudflare R2 (WORM)
        </p>
      </div>

      {/* Info */}
      <div className="rounded-lg border bg-blue-50 dark:bg-blue-950/20 p-4">
        <div className="flex gap-3">
          <Archive className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900 dark:text-blue-100">
              Conservation obligatoire de 6 ans
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
              Conformément à l'article L102 B du Livre des procédures fiscales, les données sont conservées
              en mode WORM (Write Once Read Many) sur Cloudflare R2.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Archives totales</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">fichiers stockés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Espace utilisé</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSize.toFixed(1)} MB</div>
            <p className="text-xs text-muted-foreground">sur Cloudflare R2</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rétention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.retention} ans</div>
            <p className="text-xs text-muted-foreground">légale (NF525)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conformité</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.compliance}%</div>
            <p className="text-xs text-muted-foreground">toutes archivées</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher une archive..."
                className="pl-10"
              />
            </div>
            <button className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm hover:bg-accent">
              <Calendar className="h-4 w-4" />
              Période
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Archives list */}
      <Card>
        <CardHeader>
          <CardTitle>Archives disponibles</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                  <th className="px-4 py-3 text-center text-sm font-medium">Transactions</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Taille</th>
                  <th className="px-4 py-3 text-center text-sm font-medium">Hash NF525</th>
                  <th className="px-4 py-3 text-center text-sm font-medium">Stockage</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {archives.map((archive) => (
                  <tr key={archive.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <div className="font-medium">{archive.date}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{archive.type}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      {archive.transactions}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      {archive.size}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <code className="text-xs text-muted-foreground">{archive.hash}</code>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="default">R2 WORM</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          className="rounded p-1 hover:bg-accent"
                          title="Télécharger"
                          onClick={() => window.open(archive.url, '_blank')}
                        >
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
