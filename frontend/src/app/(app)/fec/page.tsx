'use client'

import { Download, FileText, Calendar, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

export default function FECPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Export FEC</h1>
        <p className="text-muted-foreground">
          Fichier des Écritures Comptables (Article 420-1 du PCG)
        </p>
      </div>

      {/* Info Alert */}
      <div className="rounded-lg border bg-blue-50 dark:bg-blue-950/20 p-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900 dark:text-blue-100">
              Format FEC conforme
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
              L'export respecte la norme définie par l'article A47 A-1 du Livre des procédures fiscales.
              Format texte délimité par pipe (|) avec 18 colonnes obligatoires.
            </p>
          </div>
        </div>
      </div>

      {/* Export Form */}
      <Card>
        <CardHeader>
          <CardTitle>Générer un export FEC</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date de début</label>
              <Input type="date" defaultValue="2025-01-01" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date de fin</label>
              <Input type="date" defaultValue="2025-12-31" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Exercice fiscal</label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Format</label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="txt">Texte délimité (.txt)</option>
              <option value="csv">CSV (.csv)</option>
            </select>
          </div>

          <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Download className="h-4 w-4" />
            Générer et télécharger le FEC
          </button>
        </CardContent>
      </Card>

      {/* FEC Structure */}
      <Card>
        <CardHeader>
          <CardTitle>Structure du fichier FEC</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p className="font-medium">18 colonnes obligatoires :</p>
            <div className="grid grid-cols-2 gap-2 text-muted-foreground">
              <div>1. JournalCode</div>
              <div>2. JournalLib</div>
              <div>3. EcritureNum</div>
              <div>4. EcritureDate</div>
              <div>5. CompteNum</div>
              <div>6. CompteLib</div>
              <div>7. CompAuxNum</div>
              <div>8. CompAuxLib</div>
              <div>9. PieceRef</div>
              <div>10. PieceDate</div>
              <div>11. EcritureLib</div>
              <div>12. Debit</div>
              <div>13. Credit</div>
              <div>14. EcritureLet</div>
              <div>15. DateLet</div>
              <div>16. ValidDate</div>
              <div>17. Montantdevise</div>
              <div>18. Idevise</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Previous Exports */}
      <Card>
        <CardHeader>
          <CardTitle>Exports précédents</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Date génération</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Période</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Exercice</th>
                  <th className="px-4 py-3 text-center text-sm font-medium">Écritures</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Format</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr className="hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm">2025-01-15 10:30</td>
                  <td className="px-4 py-3 text-sm">01/01/2025 - 15/01/2025</td>
                  <td className="px-4 py-3 text-sm">2025</td>
                  <td className="px-4 py-3 text-center text-sm">4567</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">TXT</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button className="rounded p-1 hover:bg-accent">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm">2024-12-31 18:00</td>
                  <td className="px-4 py-3 text-sm">01/01/2024 - 31/12/2024</td>
                  <td className="px-4 py-3 text-sm">2024</td>
                  <td className="px-4 py-3 text-center text-sm">45234</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">TXT</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button className="rounded p-1 hover:bg-accent">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
