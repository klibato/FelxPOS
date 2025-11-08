'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  CreditCard,
  FileText,
  Calendar,
  Archive,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Download
} from 'lucide-react'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  badge?: string
}

const navigation: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: 'Point de Vente',
    href: '/pos',
    icon: <ShoppingCart className="h-5 w-5" />,
  },
  {
    title: 'Transactions',
    href: '/transactions',
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    title: 'Produits',
    href: '/products',
    icon: <Package className="h-5 w-5" />,
  },
  {
    title: 'Opérateurs',
    href: '/operators',
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: 'Caisses',
    href: '/registers',
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    title: 'Clôtures',
    href: '/closures',
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    title: 'Rapports NF525',
    href: '/reports',
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    title: 'Export FEC',
    href: '/fec',
    icon: <Download className="h-5 w-5" />,
  },
  {
    title: 'Archives',
    href: '/archives',
    icon: <Archive className="h-5 w-5" />,
  },
  {
    title: 'Paramètres',
    href: '/settings',
    icon: <Settings className="h-5 w-5" />,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Déconnexion réussie')
      router.push('/login')
      router.refresh()
    } catch (error: any) {
      toast.error('Erreur lors de la déconnexion', {
        description: error.message,
      })
    }
  }

  return (
    <div
      className={cn(
        'relative flex h-screen flex-col border-r bg-card transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground font-bold">
              F
            </div>
            <span className="font-semibold">FelxPOS</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-md p-1.5 hover:bg-accent"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                collapsed && 'justify-center'
              )}
              title={collapsed ? item.title : undefined}
            >
              {item.icon}
              {!collapsed && <span>{item.title}</span>}
              {!collapsed && item.badge && (
                <span className="ml-auto rounded-full bg-primary/20 px-2 py-0.5 text-xs">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-2">
        <button
          onClick={handleLogout}
          className={cn(
            'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
            collapsed && 'justify-center'
          )}
          title={collapsed ? 'Déconnexion' : undefined}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </div>
  )
}
