'use client'

import { useState } from 'react'
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default function ProductsPage() {
  const [search, setSearch] = useState('')

  // Mock data - à remplacer par les vrais hooks API
  const products = [
    {
      id: 1,
      name: 'Café Expresso',
      category: 'Boissons',
      price: 2.5,
      vat: 10,
      stock: 150,
      sku: 'CAFE-001',
      active: true,
    },
    {
      id: 2,
      name: 'Croissant',
      category: 'Viennoiseries',
      price: 1.5,
      vat: 5.5,
      stock: 45,
      sku: 'VIEN-001',
      active: true,
    },
    {
      id: 3,
      name: 'Sandwich Jambon',
      category: 'Restauration',
      price: 5.9,
      vat: 10,
      stock: 20,
      sku: 'SAND-001',
      active: true,
    },
  ]

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Produits</h1>
          <p className="text-muted-foreground">
            Gérez votre catalogue de produits
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Nouveau produit
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total produits</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">
              {products.filter((p) => p.active).length} actifs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Catégories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(products.map((p) => p.category)).size}
            </div>
            <p className="text-xs text-muted-foreground">Différentes catégories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock bas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter((p) => p.stock < 30).length}
            </div>
            <p className="text-xs text-muted-foreground">Produits à réapprovisionner</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prix moyen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(products.reduce((acc, p) => acc + p.price, 0) / products.length).toFixed(2)} €
            </div>
            <p className="text-xs text-muted-foreground">Par produit</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <button className="rounded-md border px-4 py-2 text-sm hover:bg-accent">
              Filtres
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Products table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Produit</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">SKU</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Catégorie</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Prix HT</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">TVA</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Stock</th>
                  <th className="px-4 py-3 text-center text-sm font-medium">Statut</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <div className="font-medium">{product.name}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {product.sku}
                    </td>
                    <td className="px-4 py-3 text-sm">{product.category}</td>
                    <td className="px-4 py-3 text-right font-medium">
                      {product.price.toFixed(2)} €
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      {product.vat}%
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={
                          product.stock < 30
                            ? 'text-destructive font-medium'
                            : ''
                        }
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={product.active ? 'default' : 'secondary'}>
                        {product.active ? 'Actif' : 'Inactif'}
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
