import { ref } from 'vue'
import { supabase } from '../lib/supabase.js'

export const periodeList = ref([])

export async function fetchPeriode() {
  const { data, error } = await supabase
    .from('periode_kas')
    .select('*')
    .order('tahun', { ascending: false })
    .order('bulan', { ascending: false })

  if (error) {
    console.error('Error fetching periode:', error)
    return []
  }
  periodeList.value = data || [];
  return periodeList.value;
}

export async function getOrCreatePeriode(bulan, tahun) {
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const pName = `Kas ${monthNames[bulan - 1]} ${tahun}`;
  
  // 1. Check local state
  let p = periodeList.value.find(x => x.bulan === bulan && x.tahun === tahun);
  if (p) return { success: true, data: p };
  
  // 2. Check DB directly to prevent race condition during initial load
  const { data: existing } = await supabase
    .from('periode_kas')
    .select('*')
    .eq('bulan', bulan)
    .eq('tahun', tahun)
    .maybeSingle();
    
  if (existing) {
    if (!periodeList.value.find(x => x.id === existing.id)) {
      periodeList.value.push(existing);
      periodeList.value.sort((a, b) => {
        if (b.tahun !== a.tahun) return b.tahun - a.tahun;
        return b.bulan - a.bulan;
      });
    }
    return { success: true, data: existing };
  }
  
  const d = new Date(tahun, bulan, 0);
  const batas = `${tahun}-${String(bulan).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  
  const { data: newPeriod, error } = await supabase
    .from('periode_kas')
    .insert([{
      nama_periode: pName,
      bulan: bulan,
      tahun: tahun,
      nominal: 10000,
      batas_pembayaran: batas
    }])
    .select()
    .single();
    
  if (error) return { success: false, message: error.message };
  
  periodeList.value.push(newPeriod);
  periodeList.value.sort((a, b) => {
    if (b.tahun !== a.tahun) return b.tahun - a.tahun;
    return b.bulan - a.bulan;
  });
  
  return { success: true, data: newPeriod };
}

export async function addPeriode(periodeData) {
  const { data, error } = await supabase
    .from('periode_kas')
    .insert([periodeData])
    .select()
    .single()

  if (error) return { success: false, message: error.message }
  periodeList.value.unshift(data)
  // Re-sort
  periodeList.value.sort((a, b) => {
    if (b.tahun !== a.tahun) return b.tahun - a.tahun;
    return b.bulan - a.bulan;
  })
  return { success: true, data }
}

export async function updatePeriode(id, updates) {
  const { data, error } = await supabase
    .from('periode_kas')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return { success: false, message: error.message }
  const idx = periodeList.value.findIndex(p => p.id === id)
  if (idx !== -1) periodeList.value[idx] = data
  return { success: true, data }
}

export async function deletePeriode(id) {
  const { error } = await supabase
    .from('periode_kas')
    .delete()
    .eq('id', id)

  if (error) return { success: false, message: error.message }
  periodeList.value = periodeList.value.filter(p => p.id !== id)
  return { success: true }
}

/**
 * Delete all periods EXCEPT the given IDs.
 * Also deletes associated pembayaran_kas first.
 */
export async function deletePeriodsExcept(keepIds) {
  const toDelete = periodeList.value.filter(p => !keepIds.includes(p.id))
  if (toDelete.length === 0) return { success: true, deleted: 0 }

  const deleteIds = toDelete.map(p => p.id)

  // Delete payments first
  const { error: payErr } = await supabase
    .from('pembayaran_kas')
    .delete()
    .in('periode_kas_id', deleteIds)
  if (payErr) return { success: false, message: payErr.message }

  // Delete periods
  const { error } = await supabase
    .from('periode_kas')
    .delete()
    .in('id', deleteIds)
  if (error) return { success: false, message: error.message }

  periodeList.value = periodeList.value.filter(p => keepIds.includes(p.id))
  return { success: true, deleted: toDelete.length }
}
