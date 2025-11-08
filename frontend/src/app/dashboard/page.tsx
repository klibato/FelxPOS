'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDailyStats } from '@/hooks/useStats';
import { useTransactions } from '@/hooks/useTransactions';
import { useClosures, useCreateClosure } from '@/hooks/useClosures';
import { useAuditAnomalies } from '@/hooks/useAudit';
import { formatCurrency, formatDate, isTodayClosureDone } from '@/lib/utils';
import {
  TrendingUp,
  Euro,
  Receipt,
  AlertTriangle,
  CheckCircle,
  Lock,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDailyStats();
  const { data: transactions = [] } = useTransactions();
  const { data: closures = [] } = useClosures();
  const { data: anomalies = [] } = useAuditAnomalies();
  const createClosure = useCreateClosure();

  const today = new Date().toISOString().split('T')[0];
  const isClosed = isTodayClosureDone(closures);

  const handleClosure = async () => {
    if (!confirm('Voulez-vous effectuer la clôture journalière ?')) return;

    try {
      await createClosure.mutateAsync({
        date: today,
        registerId: 'ca111111-1111-1111-1111-111111111111', // TODO: get from context
      });
    } catch (error) {
      console.error('Closure error:', error);
    }
  };

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Tableau de bord</h1>
              <p className="text-muted-foreground mt-1">
                {new Date().toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/pos">
                <Button size="lg">
                  <Receipt className="mr-2 h-5 w-5" />
                  Ouvrir la Caisse
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Alerts */}
        {anomalies.length > 0 && (
          <Card className="mb-6 border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Alertes de Conformité NF525
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {anomalies.map((anomaly, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-3 bg-destructive/10 rounded-md"
                  >
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <span className="text-sm">{anomaly.message}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Closure Status */}
        <Card className={`mb-6 ${isClosed ? 'border-green-500' : 'border-yellow-500'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isClosed ? (
                  <>
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    <div>
                      <p className="font-medium">Clôture journalière effectuée</p>
                      <p className="text-sm text-muted-foreground">
                        Les données du jour ont été archivées de manière sécurisée
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-6 w-6 text-yellow-500" />
                    <div>
                      <p className="font-medium">Clôture journalière en attente</p>
                      <p className="text-sm text-muted-foreground">
                        La clôture doit être effectuée avant minuit (obligatoire NF525)
                      </p>
                    </div>
                  </>
                )}
              </div>
              {!isClosed && (
                <Button
                  onClick={handleClosure}
                  disabled={createClosure.isPending || transactions.length === 0}
                  variant={transactions.length > 0 ? 'default' : 'secondary'}
                >
                  <Lock className="mr-2 h-4 w-4" />
                  {createClosure.isPending ? 'Clôture en cours...' : 'Effectuer la clôture'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats?.totalRevenue || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.totalSales || 0} ventes aujourd'hui
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalTransactions || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.totalRefunds || 0} remboursements
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket moyen</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(
                  (stats?.totalSales ?? 0) > 0 ? (stats?.totalRevenue || 0) / (stats?.totalSales ?? 1) : 0
                )}
              </div>
              <p className="text-xs text-muted-foreground">Par transaction</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">TVA collectée</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(
                  Object.values(stats?.vatBreakdown || {}).reduce(
                    (sum: number, vat: any) => sum + vat.vat,
                    0
                  )
                )}
              </div>
              <p className="text-xs text-muted-foreground">Toutes taxes confondues</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* VAT Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Répartition TVA</CardTitle>
              <CardDescription>Détail par taux de TVA</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats?.vatBreakdown || {}).map(([rate, details]: [string, any]) => (
                  <div key={rate} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">TVA {rate}%</Badge>
                      <span className="text-sm text-muted-foreground">
                        Base HT: {formatCurrency(details.ht)}
                      </span>
                    </div>
                    <span className="font-medium">{formatCurrency(details.vat)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Moyens de paiement</CardTitle>
              <CardDescription>Répartition des encaissements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats?.paymentMethods || {}).map(([method, amount]: [string, any]) => (
                  <div key={method} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{method}</span>
                    <span className="font-medium">{formatCurrency(amount)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Dernières transactions</CardTitle>
              <CardDescription>Les 10 dernières ventes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {transactions.slice(0, 10).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{transaction.receiptNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(transaction.transactionDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(transaction.totalTtc)}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {transaction.paymentMethod}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
