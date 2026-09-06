import { ref } from 'vue'
import { createClient } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase.js'

// Global reactive state for current user session
export const currentUser = ref(null)
export const isAuthReady = ref(false)

// Init auth listener to automatically sync session with Supabase
export function initAuth() {
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      // Fetch full profile info for role, name, etc
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      
      if (profile) {
        currentUser.value = {
          ...session.user,
          ...profile,
          avatar: profile.nama.slice(0, 2).toUpperCase()
        }
      } else {
        currentUser.value = null
      }
    } else {
      currentUser.value = null
    }
    isAuthReady.value = true
  })
}

export function getCurrentUser() {
  return currentUser.value
}

export async function login(username, password) {
  // Map username to the fake local email used for Supabase Auth
  const email = `${username}@kasly.com`
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      return { success: false, message: 'Username atau password salah' }
    }
    return { success: false, message: error.message }
  }
  return { success: true }
}

export async function logout() {
  await supabase.auth.signOut()
}

// Admin only: Add a new user using an isolated client so it doesn't log the admin out
export async function addUser(userData) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  const isolatedClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
  })

  const email = `${userData.username}@kasly.com`
  
  const { data, error } = await isolatedClient.auth.signUp({
    email,
    password: userData.password,
    options: {
      data: {
        nama: userData.name,
        role: userData.role,
        username: userData.username
      }
    }
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { success: false, message: 'Username sudah digunakan.' }
    }
    return { success: false, message: error.message }
  }

  return { success: true }
}

export async function getUsers() {
  const { data } = await supabase.from('profiles').select('*')
  return data || []
}

export async function updateUser(id, userData) {
  const { error } = await supabase.from('profiles').update(userData).eq('id', id)
  if (error) return { success: false, message: error.message }
  return { success: true }
}

export async function deleteUser(id) {
  const { error } = await supabase.from('profiles').delete().eq('id', id)
  if (error) {
    if (error.code === '23503') {
      return { success: false, message: 'User tidak bisa dihapus karena memiliki riwayat transaksi.' }
    }
    return { success: false, message: error.message }
  }
  return { success: true }
}
