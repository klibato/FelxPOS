'use client'

import { Shield, AlertTriangle, CheckCircle2, FileText, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function ReportsPage() {
  const complianceData = {
    hashChainIntegrity: true,
    dailyClosures: true,
    archiveStatus: 98,
    lastAudit: '2025-01-15',
    totalTransactions: 4567,
    anomalies: 0,
  }

  const alerts = [
    {
      id: 1,
      type: 'warning',
      message: 'Clôture du 2025-01-13 non archivée',
      date: '2025-01-14',
    },
  ]

  const auditLogs = [
    {
      id: 1,
      timestamp: '2025-01-15 18:00:00',
      event: 'DAILY_CLOSURE',
      operator: 'System',
      details: 'Clôture automatique - Caisse 1',
      hash: 'a3f5...8c2d',
    },
    {
      id: 2,
      timestamp: '2025-01-15 15:30:25',
      event: 'TRANSACTION_CREATED',
      operator: 'Marie Dupont',
      details: 'Ticket T-2025-001234',
      hash: 'b7d9...1f4a',
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Rapports NF525</h1>
        <p className="text-muted-foreground">
          Conformité et audits de sécurité
        </p>
      </div>

      {/* Compliance Status */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chaîne de hash</CardTitle>
            <Shield className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {complianceData.hashChainIntegrity ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-600">Intègre</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <span className="font-medium text-destructive">Erreur</span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {complianceData.totalTransactions} transactions vérifiées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clôtures journalières</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-600">Conformes</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Dernière clôture: {complianceData.lastAudit}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Archivage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceData.archiveStatus}%</div>
            <p className="text-xs text-muted-foreground">
              Données archivées sur R2
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Alertes de conformité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 rounded-lg border p-3 bg-yellow-50 dark:bg-yellow-950/20"
                >
                  <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {alert.date}
                    </p>
                  </div>
                  <button className="text-sm text-primary hover:underline">
                    Résoudre
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Rapports rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <button className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div className="text-left">
                  <p className="font-medium">Rapport de conformité</p>
                  <p className="text-xs text-muted-foreground">
                    Statut complet NF525
                  </p>
                </div>
              </div>
              <Download className="h-4 w-4" />
            </button>

            <button className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div className="text-left">
                  <p className="font-medium">Vérification hash</p>
                  <p className="text-xs text-muted-foreground">
                    Intégrité de la chaîne
                  </p>
                </div>
              </div>
              <Download className="h-4 w-4" />
            </button>

            <button className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div className="text-left">
                  <p className="font-medium">Journal d'audit</p>
                  <p className="text-xs text-muted-foreground">
                    Tous les événements
                  </p>
                </div>
              </div>
              <Download className="h-4 w-4" />
            </button>

            <button className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div className="text-left">
                  <p className="font-medium">Certificat de conformité</p>
                  <p className="text-xs text-muted-foreground">
                    Attestation NF525
                  </p>
                </div>
              </div>
              <Download className="h-4 w-4" />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log */}
      <Card>
        <CardHeader>
          <CardTitle>Journal d'audit (dernières entrées)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Horodatage</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Événement</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Opérateur</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Détails</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm font-mono">{log.timestamp}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{log.event}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">{log.operator}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {log.details}
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs text-muted-foreground">{log.hash}</code>
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
