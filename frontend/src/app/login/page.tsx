'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { LogIn } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error('Erreur de connexion', {
          description: error.message,
        })
        return
      }

      if (data.session) {
        toast.success('Connexion réussie')
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error: any) {
      toast.error('Erreur de connexion', {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-2xl dark:bg-gray-900">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <span className="text-2xl font-bold">F</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold">FelxPOS</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Caisse enregistreuse NF525
          </p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? (
              'Connexion...'
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Se connecter
              </>
            )}
          </button>

          <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 text-center text-sm dark:border-yellow-900 dark:bg-yellow-950">
            <p className="font-medium text-yellow-800 dark:text-yellow-200">
              Configuration requise
            </p>
            <p className="mt-2 text-xs text-yellow-700 dark:text-yellow-300">
              Pour vous connecter, créez d'abord un compte utilisateur dans votre instance Supabase
              avec l'email et le mot de passe souhaités.
            </p>
            <p className="mt-2 text-xs text-yellow-700 dark:text-yellow-300">
              Les utilisateurs sont gérés via Supabase Auth (NEXT_PUBLIC_SUPABASE_URL).
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
