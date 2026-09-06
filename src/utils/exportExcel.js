import * as XLSX from 'xlsx'
import { formatCurrency, formatShortDate } from './formatters.js'

export function exportTransactionsToExcel(transactions, accounts, categories, filterLabel = '') {
  const wb = XLSX.utils.book_new()

  // Header info
  const headerRows = [
    ['UNIVERSITAS GUNADARMA'],
    ['Sistem Manajemen Kas Kelas'],
    ['Kelas: 3KA25'],
    [''],
    [`Laporan Transaksi Kas${filterLabel ? ' - ' + filterLabel : ''}`],
    [`Dicetak pada: ${formatShortDate(new Date().toISOString())}`],
    [''],
    ['No', 'Tanggal', 'Keterangan', 'Rekening', 'Kategori', 'Jenis', 'Jumlah'],
  ]

  const dataRows = transactions.map((t, i) => {
    const account = accounts.find(a => a.id === t.accountId)
    const category = categories.find(c => c.id === t.categoryId)
    return [
      i + 1,
      formatShortDate(t.date),
      t.description,
      account?.name || '-',
      category?.name || '-',
      t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      t.amount,
    ]
  })

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  const footerRows = [
    [''],
    ['', '', '', '', '', 'Total Pemasukan', totalIncome],
    ['', '', '', '', '', 'Total Pengeluaran', totalExpense],
    ['', '', '', '', '', 'Saldo', totalIncome - totalExpense],
  ]

  const allRows = [...headerRows, ...dataRows, ...footerRows]
  const ws = XLSX.utils.aoa_to_sheet(allRows)

  // Column widths
  ws['!cols'] = [
    { wch: 5 }, { wch: 15 }, { wch: 35 }, { wch: 20 }, { wch: 18 }, { wch: 15 }, { wch: 18 }
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Transaksi')
  XLSX.writeFile(wb, `Laporan_Kas_3KA25_${new Date().toISOString().split('T')[0]}.xlsx`)
}

export function exportReportToExcel(data, label = '') {
  const { transactions, accounts, categories, monthlyData } = data
  const wb = XLSX.utils.book_new()

  // Summary sheet
  const summaryRows = [
    ['UNIVERSITAS GUNADARMA'],
    ['Sistem Manajemen Kas Kelas 3KA25'],
    [`Laporan Keuangan: ${label}`],
    [`Dicetak: ${formatShortDate(new Date().toISOString())}`],
    [''],
    ['RINGKASAN KEUANGAN'],
    ['Total Pemasukan', data.totalIncome],
    ['Total Pengeluaran', data.totalExpense],
    ['Saldo Bersih', data.totalIncome - data.totalExpense],
    [''],
    ['SALDO PER REKENING'],
    ['Rekening', 'Saldo'],
    ...accounts.map(a => [a.name, a.balance]),
  ]

  const ws1 = XLSX.utils.aoa_to_sheet(summaryRows)
  ws1['!cols'] = [{ wch: 30 }, { wch: 20 }]
  XLSX.utils.book_append_sheet(wb, ws1, 'Ringkasan')

  // Transactions sheet
  const txRows = [
    ['No', 'Tanggal', 'Keterangan', 'Rekening', 'Kategori', 'Jenis', 'Jumlah'],
    ...transactions.map((t, i) => {
      const account = accounts.find(a => a.id === t.accountId)
      const category = categories.find(c => c.id === t.categoryId)
      return [i + 1, formatShortDate(t.date), t.description, account?.name || '-', category?.name || '-', t.type === 'income' ? 'Pemasukan' : 'Pengeluaran', t.amount]
    })
  ]
  const ws2 = XLSX.utils.aoa_to_sheet(txRows)
  ws2['!cols'] = [{ wch: 5 }, { wch: 15 }, { wch: 35 }, { wch: 20 }, { wch: 18 }, { wch: 15 }, { wch: 18 }]
  XLSX.utils.book_append_sheet(wb, ws2, 'Detail Transaksi')

  XLSX.writeFile(wb, `Laporan_Keuangan_3KA25_${new Date().toISOString().split('T')[0]}.xlsx`)
}

export function exportRekapToExcel(rekapAnggota) {
  const wb = XLSX.utils.book_new()

  const headerRows = [
    ['UNIVERSITAS GUNADARMA'],
    ['Sistem Manajemen Kas Kelas 3KA25'],
    ['Laporan Rekapitulasi Saldo Anggota'],
    [`Dicetak pada: ${formatShortDate(new Date().toISOString())}`],
    [''],
    ['No', 'Nama Anggota', 'Total Setoran', 'Total Penarikan', 'Sisa Saldo Kas'],
  ]

  let totalSetoran = 0
  let totalPenarikan = 0
  let totalSaldo = 0

  const dataRows = rekapAnggota.map((m, i) => {
    totalSetoran += m.totalBayar
    totalPenarikan += m.totalTarik
    totalSaldo += m.saldo
    return [
      i + 1,
      m.nama,
      m.totalBayar,
      m.totalTarik,
      m.saldo
    ]
  })

  const footerRows = [
    ['', 'TOTAL KESELURUHAN', totalSetoran, totalPenarikan, totalSaldo]
  ]

  const allRows = [...headerRows, ...dataRows, ...footerRows]
  const ws = XLSX.utils.aoa_to_sheet(allRows)

  ws['!cols'] = [
    { wch: 5 }, { wch: 35 }, { wch: 20 }, { wch: 20 }, { wch: 20 }
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Rekap Anggota')
  XLSX.writeFile(wb, `Rekap_Anggota_3KA25_${new Date().toISOString().split('T')[0]}.xlsx`)
}
