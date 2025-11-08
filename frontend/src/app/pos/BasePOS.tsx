'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useProducts } from '@/hooks/useProducts';
import { useCreateTransaction } from '@/hooks/useTransactions';
import { formatCurrency, calculateTotal, getVatRateLabel } from '@/lib/utils';
import { Search, Trash2, Plus, Minus, CreditCard, Banknote } from 'lucide-react';
import type { TransactionItem } from '@/lib/api';

export interface BasePOSProps {
  title?: string;
  customProductGrid?: React.ReactNode;
}

export function BasePOS({ title = 'Point de Vente', customProductGrid }: BasePOSProps) {
  const [cart, setCart] = useState<TransactionItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('card');

  const { data: products = [], isLoading } = useProducts();
  const createTransaction = useCreateTransaction();

  // Filter products by search query
  const filteredProducts = products.filter(
    (p) =>
      p.isActive &&
      (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Add product to cart
  const addToCart = (product: any) => {
    const existingItem = cart.find((item) => item.sku === product.sku);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.sku === product.sku ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          sku: product.sku,
          name: product.name,
          price: product.price,
          quantity: 1,
          vatRate: product.vatRate,
        },
      ]);
    }
  };

  // Remove from cart
  const removeFromCart = (sku: string) => {
    setCart(cart.filter((item) => item.sku !== sku));
  };

  // Update quantity
  const updateQuantity = (sku: string, delta: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.sku === sku) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is TransactionItem => item !== null)
    );
  };

  // Calculate totals
  const subtotal = calculateTotal(cart);
  const total = subtotal;

  // Validate and submit transaction
  const handleValidate = async () => {
    if (cart.length === 0) {
      alert('Le panier est vide');
      return;
    }

    try {
      await createTransaction.mutateAsync({
        items: cart,
        paymentMethod,
      });

      // Clear cart on success
      setCart([]);
      setSearchQuery('');
    } catch (error) {
      console.error('Transaction error:', error);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 shadow-md">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{title}</h1>
          <Badge variant="secondary">Conforme NF525</Badge>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Products Grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Rechercher un produit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
          </div>

          {/* Custom Grid or Default */}
          {customProductGrid || (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {isLoading ? (
                <div className="col-span-full text-center py-10 text-muted-foreground">
                  Chargement...
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="col-span-full text-center py-10 text-muted-foreground">
                  Aucun produit trouvé
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <Button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <span className="font-bold text-lg">{product.name}</span>
                    <span className="text-sm">{formatCurrency(product.price)}</span>
                    <span className="text-xs opacity-70">TVA {getVatRateLabel(product.vatRate)}</span>
                  </Button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Cart Panel */}
        <div className="w-96 bg-white border-l shadow-lg flex flex-col">
          {/* Cart Header */}
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold">Panier</h2>
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="text-sm text-destructive hover:underline mt-1"
              >
                Vider le panier
              </button>
            )}
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {cart.length === 0 ? (
              <div className="text-center text-muted-foreground py-10">
                Le panier est vide
              </div>
            ) : (
              cart.map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(item.price)} × {item.quantity}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <p className="font-bold">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.sku!, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.sku!, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            className="h-7 w-7"
                            onClick={() => removeFromCart(item.sku!)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Cart Footer */}
          <div className="p-4 border-t space-y-4">
            {/* Total */}
            <div className="space-y-2">
              <div className="flex justify-between text-lg">
                <span>Sous-total HT:</span>
                <span>{formatCurrency(subtotal * 0.91)}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span>TVA:</span>
                <span>{formatCurrency(subtotal * 0.09)}</span>
              </div>
              <div className="flex justify-between text-2xl font-bold">
                <span>Total TTC:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Mode de paiement:</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={paymentMethod === 'card' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('card')}
                  className="h-12"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Carte
                </Button>
                <Button
                  variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('cash')}
                  className="h-12"
                >
                  <Banknote className="mr-2 h-4 w-4" />
                  Espèces
                </Button>
              </div>
            </div>

            {/* Validate Button */}
            <Button
              onClick={handleValidate}
              disabled={cart.length === 0 || createTransaction.isPending}
              className="w-full h-14 text-lg font-bold"
              size="lg"
            >
              {createTransaction.isPending ? 'Traitement...' : 'Valider la vente'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
