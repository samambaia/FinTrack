import { supabase } from './supabase';

// Simple hash function for passwords (for demo purposes)
// In production, use bcrypt or similar on the backend
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export interface AuthUser {
  id: string;
  email: string;
}

export const registerUser = async (email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> => {
  try {
    // Check if user already exists
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('email')
      .eq('email', email);

    if (checkError) {
      return { user: null, error: checkError.message };
    }

    if (existingUsers && existingUsers.length > 0) {
      return { user: null, error: 'Email already registered' };
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Insert new user
    const { data, error } = await supabase
      .from('users')
      .insert({ email, password_hash: passwordHash })
      .select('id, email')
      .single();

    if (error) {
      return { user: null, error: error.message };
    }

    return { user: data, error: null };
  } catch (err) {
    return { user: null, error: 'An unexpected error occurred' };
  }
};

export const loginUser = async (email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> => {
  try {
    // Hash the password
    const passwordHash = await hashPassword(password);

    // Find user with matching email and password
    const { data, error } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .eq('password_hash', passwordHash)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { user: null, error: 'Invalid email or password' };
      }
      return { user: null, error: error.message };
    }

    console.log('🔐 Logged in user:', data);
    return { user: data, error: null };
  } catch (err) {
    return { user: null, error: 'An unexpected error occurred' };
  }
};

export const logoutUser = () => {
  localStorage.removeItem('fintrack_user');
};

export const getCurrentUser = (): AuthUser | null => {
  const userStr = localStorage.getItem('fintrack_user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const saveCurrentUser = (user: AuthUser) => {
  localStorage.setItem('fintrack_user', JSON.stringify(user));
};
