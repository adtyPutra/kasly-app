import { ref } from 'vue'
import { supabase } from '../lib/supabase.js'
import { pengeluaranList } from './pengeluaranKelas.js'

export const kegiatanList = ref([])

export async function fetchKegiatan() {
  const { data, error } = await supabase
    .from('kegiatan')
    .select('*')
    .order('tanggal', { ascending: false })
  
  if (error) {
    console.error('Error fetching kegiatan:', error)
    return []
  }
  kegiatanList.value = data
  return data
}

export async function addKegiatan(kegiatanData) {
  const { data, error } = await supabase
    .from('kegiatan')
    .insert([kegiatanData])
    .select()
    .single()
    
  if (error) return { success: false, message: error.message }
  kegiatanList.value.unshift(data)
  return { success: true, data }
}

export async function updateKegiatan(id, updates) {
  const { data, error } = await supabase
    .from('kegiatan')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
    
  if (error) return { success: false, message: error.message }
  const idx = kegiatanList.value.findIndex(k => k.id === id)
  if (idx !== -1) kegiatanList.value[idx] = data
  return { success: true, data }
}

export function getKegiatanSummary(kegiatanId) {
  const k = kegiatanList.value.find(k => k.id === kegiatanId)
  if (!k) return { anggaran: 0, totalPengeluaran: 0, sisaDana: 0 }
  
  const relatedExpenses = pengeluaranList.value.filter(p => p.kegiatan_id === kegiatanId && p.status === 'aktif')
  const totalPengeluaran = relatedExpenses.reduce((sum, p) => sum + p.nominal, 0)
  
  return {
    anggaran: k.anggaran,
    totalPengeluaran,
    sisaDana: k.anggaran - totalPengeluaran
  }
}
