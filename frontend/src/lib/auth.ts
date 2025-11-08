import { supabase } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
  tenantId: string;
  role: 'admin' | 'manager' | 'cashier' | 'accountant';
  firstName?: string;
  lastName?: string;
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

/**
 * Sign out
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Get current session
 */
export async function getSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

/**
 * Get current user with profile
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getSession();
  if (!session) return null;

  // Fetch user profile from operators table
  const { data: operator, error } = await supabase
    .from('operators')
    .select('*')
    .eq('supabase_user_id', session.user.id)
    .single();

  if (error || !operator) return null;

  return {
    id: operator.id,
    email: operator.email,
    tenantId: operator.tenant_id,
    role: operator.role,
    firstName: operator.first_name,
    lastName: operator.last_name,
  };
}

/**
 * Check if user has permission
 */
export function hasPermission(user: AuthUser | null, permission: string): boolean {
  if (!user) return false;

  // Admins have all permissions
  if (user.role === 'admin') return true;

  // Define role permissions
  const rolePermissions: Record<string, string[]> = {
    admin: ['*'],
    manager: ['pos', 'closure', 'reports', 'products', 'operators'],
    cashier: ['pos'],
    accountant: ['reports', 'exports', 'closure'],
  };

  const permissions = rolePermissions[user.role] || [];
  return permissions.includes('*') || permissions.includes(permission);
}
