'use client'

import { Save, Building2, Receipt, Shield, Bell } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground">
          Configuration de votre entreprise et du système
        </p>
      </div>

      {/* Company Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Informations entreprise
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Raison sociale</label>
              <Input defaultValue="Ma Super Boulangerie SARL" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">SIRET</label>
              <Input defaultValue="123 456 789 00012" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Adresse</label>
              <Input defaultValue="123 Rue de la Paix" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ville</label>
              <Input defaultValue="Paris" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Code postal</label>
              <Input defaultValue="75001" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Téléphone</label>
              <Input defaultValue="01 23 45 67 89" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input type="email" defaultValue="contact@maboulangerie.fr" />
          </div>
        </CardContent>
      </Card>

      {/* Business Type */}
      <Card>
        <CardHeader>
          <CardTitle>Type d'activité</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Secteur d'activité</label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="restaurant">Restaurant / Café</option>
              <option value="retail">Commerce de détail</option>
              <option value="beauty">Salon de beauté</option>
              <option value="bakery" selected>Boulangerie / Pâtisserie</option>
              <option value="event">Événementiel</option>
            </select>
          </div>

          <div className="rounded-lg border p-4 bg-muted/50">
            <p className="text-sm text-muted-foreground">
              Le type d'activité détermine les taux de TVA applicables et les catégories de produits disponibles.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* VAT Rates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Taux de TVA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {[
              { label: 'Taux normal', value: '20', description: 'Produits et services standard' },
              { label: 'Taux intermédiaire', value: '10', description: 'Restauration sur place' },
              { label: 'Taux réduit', value: '5.5', description: 'Produits alimentaires de base' },
              { label: 'Taux super réduit', value: '2.1', description: 'Médicaments remboursables' },
            ].map((rate, i) => (
              <div key={i} className="flex items-center gap-4 rounded-lg border p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{rate.label}</p>
                    <Badge variant="outline">{rate.value}%</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{rate.description}</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 rounded border-gray-300"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* NF525 Config */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Configuration NF525
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex-1">
              <p className="font-medium">Clôture automatique</p>
              <p className="text-sm text-muted-foreground mt-1">
                Effectuer automatiquement la clôture journalière à 23h59
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 rounded border-gray-300"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex-1">
              <p className="font-medium">Archivage automatique</p>
              <p className="text-sm text-muted-foreground mt-1">
                Archiver automatiquement les clôtures sur Cloudflare R2
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 rounded border-gray-300"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex-1">
              <p className="font-medium">Alertes de conformité</p>
              <p className="text-sm text-muted-foreground mt-1">
                Recevoir des notifications en cas d'anomalie NF525
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 rounded border-gray-300"
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex-1">
              <p className="font-medium">Rapports quotidiens</p>
              <p className="text-sm text-muted-foreground mt-1">
                Recevoir un résumé journalier par email
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 rounded border-gray-300"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex-1">
              <p className="font-medium">Alertes stock bas</p>
              <p className="text-sm text-muted-foreground mt-1">
                Être notifié quand un produit passe sous le seuil
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 rounded border-gray-300"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save button */}
      <div className="flex justify-end">
        <button className="flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Save className="h-4 w-4" />
          Enregistrer les modifications
        </button>
      </div>
    </div>
  )
}
