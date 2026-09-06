import { ref } from 'vue'
import { supabase } from '../lib/supabase.js'
import { getCurrentUser } from './auth.js'
import { getSaldoKas } from './saldo.js'

export const pengeluaranList = ref([])
export const kategoriList = ref([])

export async function fetchKategori() {
  const { data, error } = await supabase
    .from('kategori')
    .select('*')
    .eq('aktif', true)
    .order('nama', { ascending: true })
  
  if (!error) kategoriList.value = data
  return data || []
}

export async function fetchPengeluaran() {
  const { data, error } = await supabase
    .from('pengeluaran_kelas')
    .select('*, kategori(*), kegiatan(*), dicatat_oleh_profile:profiles(nama)')
    .eq('status', 'aktif')
    .order('tanggal', { ascending: false })
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching pengeluaran:', error)
    return []
  }
  pengeluaranList.value = data
  return data
}

export async function addPengeluaran(pengeluaranData) {
  const saldoKas = getSaldoKas()
  if (saldoKas < pengeluaranData.nominal) {
    // We allow it, but we can warn. Usually we just accept, but if needed we can block.
    // For now, let's accept because kas can go slightly negative in real life if Bendahara nombok, 
    // but the spec says "Saldo tidak boleh menjadi negatif." Let's block it.
    return { success: false, message: `Saldo kas kelas tidak mencukupi. Sisa saldo kas: Rp${saldoKas.toLocaleString('id-ID')}` }
  }

  const user = getCurrentUser()
  const { data, error } = await supabase
    .from('pengeluaran_kelas')
    .insert([{
      ...pengeluaranData,
      dicatat_oleh: user?.id || null
    }])
    .select('*, kategori(*), kegiatan(*), dicatat_oleh_profile:profiles(nama)')
    .single()
    
  if (error) return { success: false, message: error.message }
  
  pengeluaranList.value.unshift(data)
  return { success: true, data }
}

export async function cancelPengeluaran(id) {
  const { data, error } = await supabase
    .from('pengeluaran_kelas')
    .update({ status: 'dibatalkan', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
    
  if (error) return { success: false, message: error.message }
  
  pengeluaranList.value = pengeluaranList.value.filter(p => p.id !== id)
  return { success: true }
}
