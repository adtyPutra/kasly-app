import { ref } from 'vue'
import { supabase } from '../lib/supabase.js'

export const anggotaList = ref([])

export async function fetchAnggota() {
  const { data, error } = await supabase
    .from('anggota')
    .select('*')
    .order('nama', { ascending: true })
  
  if (error) {
    console.error('Error fetching anggota:', error)
    return []
  }
  anggotaList.value = data
  return data
}

export async function addAnggota(nama) {
  const { data, error } = await supabase
    .from('anggota')
    .insert([{ nama, status: 'aktif' }])
    .select()
    .single()
    
  if (error) return { success: false, message: error.message }
  anggotaList.value.push(data)
  // Re-sort
  anggotaList.value.sort((a, b) => a.nama.localeCompare(b.nama))
  return { success: true, data }
}

export async function updateAnggota(id, updates) {
  const { data, error } = await supabase
    .from('anggota')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
    
  if (error) return { success: false, message: error.message }
  const idx = anggotaList.value.findIndex(a => a.id === id)
  if (idx !== -1) anggotaList.value[idx] = data
  return { success: true, data }
}

export async function deleteAnggota(id) {
  const { error } = await supabase
    .from('anggota')
    .delete()
    .eq('id', id)
    
  if (error) {
    if (error.code === '23503') { // Foreign key constraint violation code
      return { success: false, message: 'Gagal menghapus. Anggota ini memiliki riwayat transaksi.' }
    }
    return { success: false, message: error.message }
  }
  
  anggotaList.value = anggotaList.value.filter(a => a.id !== id)
  return { success: true }
}
