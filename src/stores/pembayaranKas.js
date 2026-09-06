import { ref } from 'vue'
import { supabase } from '../lib/supabase.js'
import { getCurrentUser } from './auth.js'
import { periodeList } from './periodeKas.js'

export const pembayaranList = ref([])

export async function fetchPembayaran() {
  const { data, error } = await supabase
    .from('pembayaran_kas')
    .select('*, periode_kas(*), anggota(*), dicatat_oleh_profile:profiles(nama)')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching pembayaran:', error)
    return []
  }
  pembayaranList.value = data || []
  return pembayaranList.value
}

export async function addBulkPembayaran(payloads) {
  const user = getCurrentUser()
  const today = new Date().toISOString().split('T')[0]
  
  const newPays = payloads.map(payData => ({
    ...payData,
    tanggal_bayar: payData.tanggal_bayar || today,
    status: payData.status || 'sudah_bayar',
    dicatat_oleh: user?.id || null
  }))

  const { data, error } = await supabase
    .from('pembayaran_kas')
    .insert(newPays)
    .select('*, periode_kas(*), anggota(*), dicatat_oleh_profile:profiles(nama)')
    
  if (error) {
    if (error.code === '23505') return { success: false, message: 'Sebagian pembayaran sudah tercatat' }
    return { success: false, message: error.message }
  }
  
  pembayaranList.value = [...data, ...pembayaranList.value]
  return { success: true, data }
}

export async function addPembayaran(payData, batasPembayaranStr) {
  const user = getCurrentUser()
  const today = new Date().toISOString().split('T')[0]
  const payDate = payData.tanggal_bayar || today
  
  // Determine status
  let status = 'sudah_bayar'
  if (batasPembayaranStr && payDate > batasPembayaranStr) {
    status = 'telat_bayar'
  }

  const newPay = {
    ...payData,
    tanggal_bayar: payDate,
    status,
    dicatat_oleh: user?.id || null
  }

  const { data, error } = await supabase
    .from('pembayaran_kas')
    .insert([newPay])
    .select('*, periode_kas(*), anggota(*), dicatat_oleh_profile:profiles(nama)')
    .single()
    
  if (error) {
    // Check unique constraint violation
    if (error.code === '23505') return { success: false, message: 'Pembayaran untuk periode ini sudah dicatat' }
    return { success: false, message: error.message }
  }
  
  pembayaranList.value.unshift(data)
  return { success: true, data }
}

export async function updatePembayaran(id, updates) {
  const { data, error } = await supabase
    .from('pembayaran_kas')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*, periode_kas(*), anggota(*), dicatat_oleh_profile:profiles(nama)')
    .single()
    
  if (error) return { success: false, message: error.message }
  const idx = pembayaranList.value.findIndex(p => p.id === id)
  if (idx !== -1) pembayaranList.value[idx] = data
  return { success: true, data }
}

export async function cancelPembayaran(id) {
  // In Supabase we just delete the payment record to cancel
  const { error } = await supabase.from('pembayaran_kas').delete().eq('id', id)
  if (error) return { success: false, message: error.message }
  
  pembayaranList.value = pembayaranList.value.filter(p => p.id !== id)
  return { success: true }
}
