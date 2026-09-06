import { ref } from 'vue'
import { supabase } from '../lib/supabase.js'
import { getCurrentUser } from './auth.js'
import { getSaldoAnggota } from './saldo.js'

export const penarikanList = ref([])

export async function fetchPenarikan() {
  const { data, error } = await supabase
    .from('penarikan_dana')
    .select('*, anggota(*), dicatat_oleh_profile:profiles(nama)')
    .eq('status', 'aktif')
    .order('tanggal', { ascending: false })
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching penarikan:', error)
    return []
  }
  penarikanList.value = data
  return data
}

export async function addPenarikan(penarikanData) {
  const saldoUser = getSaldoAnggota(penarikanData.anggota_id)
  if (saldoUser < penarikanData.nominal) {
    return { success: false, message: `Saldo anggota tidak mencukupi. Sisa saldo: Rp${saldoUser.toLocaleString('id-ID')}` }
  }

  const user = getCurrentUser()
  const { data, error } = await supabase
    .from('penarikan_dana')
    .insert([{
      ...penarikanData,
      dicatat_oleh: user?.id || null
    }])
    .select('*, anggota(*), dicatat_oleh_profile:profiles(nama)')
    .single()
    
  if (error) return { success: false, message: error.message }
  
  penarikanList.value.unshift(data)
  return { success: true, data }
}

export async function cancelPenarikan(id) {
  const { data, error } = await supabase
    .from('penarikan_dana')
    .update({ status: 'dibatalkan', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
    
  if (error) return { success: false, message: error.message }
  
  penarikanList.value = penarikanList.value.filter(p => p.id !== id)
  return { success: true }
}
