import { computed } from 'vue'
import { pembayaranList } from './pembayaranKas.js'
import { penarikanList } from './penarikanDana.js'
import { pengeluaranList } from './pengeluaranKelas.js'

/**
 * Total Pembayaran Semua Kas (kas masuk)
 */
export const totalPemasukanKas = computed(() => {
  return pembayaranList.value
    .filter(p => p.status === 'sudah_bayar' || p.status === 'telat_bayar')
    .reduce((sum, p) => sum + Number(p.nominal), 0)
})

/**
 * Total Penarikan Semua Anggota (kas keluar)
 */
export const totalPenarikanSemua = computed(() => {
  return penarikanList.value
    .filter(p => p.status === 'aktif')
    .reduce((sum, p) => sum + Number(p.nominal), 0)
})

/**
 * Total Pengeluaran Kelas (kas keluar)
 */
export const totalPengeluaranKelas = computed(() => {
  return pengeluaranList.value
    .filter(p => p.status === 'aktif')
    .reduce((sum, p) => sum + Number(p.nominal), 0)
})

/**
 * Saldo Kas Utama
 * = Total Pemasukan Kas - Total Penarikan Anggota - Total Pengeluaran Kelas
 */
export const saldoKasComputed = computed(() => {
  return totalPemasukanKas.value - totalPenarikanSemua.value - totalPengeluaranKelas.value
})

/**
 * Get Saldo Kas as number
 */
export function getSaldoKas() {
  return saldoKasComputed.value
}

/**
 * Total Pembayaran Anggota X
 */
export function getTotalBayarAnggota(anggotaId) {
  return pembayaranList.value
    .filter(p => p.anggota_id === anggotaId && (p.status === 'sudah_bayar' || p.status === 'telat_bayar'))
    .reduce((sum, p) => sum + Number(p.nominal), 0)
}

/**
 * Total Penarikan Anggota X
 */
export function getTotalTarikAnggota(anggotaId) {
  return penarikanList.value
    .filter(p => p.anggota_id === anggotaId && p.status === 'aktif')
    .reduce((sum, p) => sum + Number(p.nominal), 0)
}

/**
 * Saldo Anggota
 * = Total Pembayaran Anggota X - Total Penarikan Anggota X
 */
export function getSaldoAnggota(anggotaId) {
  const totalBayar = getTotalBayarAnggota(anggotaId)
  const totalTarik = getTotalTarikAnggota(anggotaId)
    
  return totalBayar - totalTarik
}
