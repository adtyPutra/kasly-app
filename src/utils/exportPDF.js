import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatCurrency, formatShortDate } from './formatters.js'

const LOGO_PLACEHOLDER = null // can be replaced with base64 logo

function addLetterhead(doc, subtitle = '') {
  const pageWidth = doc.internal.pageSize.getWidth()

  // Header background
  doc.setFillColor(26, 35, 126) // dark blue
  doc.rect(0, 0, pageWidth, 40, 'F')

  // Title
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('UNIVERSITAS GUNADARMA', pageWidth / 2, 14, { align: 'center' })

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text('Sistem Manajemen Kas Kelas | Kelas 3KA25', pageWidth / 2, 22, { align: 'center' })

  doc.setFontSize(10)
  if (subtitle) {
    doc.text(subtitle, pageWidth / 2, 30, { align: 'center' })
  }

  // Divider line
  doc.setDrawColor(79, 70, 229)
  doc.setLineWidth(1)
  doc.line(0, 40, pageWidth, 40)

  // Reset color
  doc.setTextColor(30, 30, 30)

  return 50 // return Y position after header
}

function addFooter(doc) {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const pages = doc.internal.getNumberOfPages()

  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(120, 120, 120)
    doc.text(`Dicetak: ${formatShortDate(new Date().toISOString())}`, 14, pageHeight - 8)
    doc.text(`Halaman ${i} dari ${pages}`, pageWidth - 14, pageHeight - 8, { align: 'right' })
    doc.text('Universitas Gunadarma — Kelas 3KA25', pageWidth / 2, pageHeight - 8, { align: 'center' })
  }
}

export function exportTransactionsToPDF(transactions, accounts, categories, filterLabel = '') {
  const doc = new jsPDF()
  const subtitle = `Laporan Transaksi${filterLabel ? ' — ' + filterLabel : ''}`
  const startY = addLetterhead(doc, subtitle)

  // Summary box
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  doc.setFontSize(9)
  doc.setTextColor(60, 60, 60)
  doc.text(`Total Pemasukan: ${formatCurrency(totalIncome)}`, 14, startY + 2)
  doc.text(`Total Pengeluaran: ${formatCurrency(totalExpense)}`, 14, startY + 8)
  doc.text(`Saldo Bersih: ${formatCurrency(totalIncome - totalExpense)}`, 14, startY + 14)

  const tableData = transactions.map((t, i) => {
    const account = accounts.find(a => a.id === t.accountId)
    const category = categories.find(c => c.id === t.categoryId)
    return [
      i + 1,
      formatShortDate(t.date),
      t.description,
      account?.name || '-',
      category?.name || '-',
      t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      formatCurrency(t.amount),
    ]
  })

  autoTable(doc, {
    startY: startY + 22,
    head: [['No', 'Tanggal', 'Keterangan', 'Rekening', 'Kategori', 'Jenis', 'Jumlah']],
    body: tableData,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 255] },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 24 },
      2: { cellWidth: 50 },
      3: { cellWidth: 30 },
      4: { cellWidth: 24 },
      5: { cellWidth: 22 },
      6: { cellWidth: 26, halign: 'right' },
    },
    didParseCell(data) {
      if (data.column.index === 5 && data.section === 'body') {
        if (data.cell.raw === 'Pengeluaran') {
          data.cell.styles.textColor = [239, 68, 68]
        } else {
          data.cell.styles.textColor = [16, 185, 129]
        }
      }
    }
  })

  addFooter(doc)
  doc.save(`Laporan_Kas_3KA25_${new Date().toISOString().split('T')[0]}.pdf`)
}

export function exportReportToPDF(data, label = '') {
  const doc = new jsPDF()
  const subtitle = `Laporan Keuangan | ${label}`
  let startY = addLetterhead(doc, subtitle)

  // Summary section
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 30, 30)
  doc.text('RINGKASAN KEUANGAN', 14, startY + 5)

  autoTable(doc, {
    startY: startY + 10,
    body: [
      ['Total Pemasukan', formatCurrency(data.totalIncome)],
      ['Total Pengeluaran', formatCurrency(data.totalExpense)],
      ['Saldo Bersih', formatCurrency(data.totalIncome - data.totalExpense)],
    ],
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 80 },
      1: { halign: 'right' }
    },
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229] },
    didParseCell(data) {
      if (data.row.index === 1 && data.column.index === 1) data.cell.styles.textColor = [239, 68, 68]
      if (data.row.index === 0 && data.column.index === 1) data.cell.styles.textColor = [16, 185, 129]
    }
  })

  // Accounts
  startY = doc.lastAutoTable.finalY + 10
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('SALDO PER REKENING', 14, startY)

  autoTable(doc, {
    startY: startY + 5,
    head: [['Rekening', 'Saldo']],
    body: data.accounts.map(a => [a.name, formatCurrency(a.balance)]),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [79, 70, 229], textColor: 255 },
    columnStyles: { 1: { halign: 'right' } }
  })

  // Transactions
  startY = doc.lastAutoTable.finalY + 10
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('DETAIL TRANSAKSI', 14, startY)

  const tableData = data.transactions.map((t, i) => {
    const account = data.accounts.find(a => a.id === t.accountId)
    const category = data.categories.find(c => c.id === t.categoryId)
    return [
      i + 1,
      formatShortDate(t.date),
      t.description,
      account?.name || '-',
      category?.name || '-',
      t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      formatCurrency(t.amount),
    ]
  })

  autoTable(doc, {
    startY: startY + 5,
    head: [['No', 'Tanggal', 'Keterangan', 'Rekening', 'Kategori', 'Jenis', 'Jumlah']],
    body: tableData,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [79, 70, 229], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 255] },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 22 },
      2: { cellWidth: 46 },
      3: { cellWidth: 28 },
      4: { cellWidth: 22 },
      5: { cellWidth: 22 },
      6: { cellWidth: 26, halign: 'right' },
    },
  })

  addFooter(doc)
  doc.save(`Laporan_Keuangan_3KA25_${new Date().toISOString().split('T')[0]}.pdf`)
}

export function exportDebtToPDF(debts, label = '') {
  const doc = new jsPDF()
  const subtitle = `Laporan Hutang & Piutang${label ? ' — ' + label : ''}`
  const startY = addLetterhead(doc, subtitle)

  const receivable = debts.filter(d => d.type === 'receivable')
  const payable = debts.filter(d => d.type === 'payable')
  const totalReceivable = receivable.reduce((s, d) => s + d.amount, 0)
  const totalPayable = payable.reduce((s, d) => s + d.amount, 0)

  // Summary
  autoTable(doc, {
    startY: startY + 5,
    body: [
      ['Total Piutang (harus diterima)', formatCurrency(totalReceivable)],
      ['Total Hutang (harus dibayar)', formatCurrency(totalPayable)],
    ],
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 80 }, 1: { halign: 'right' } },
    theme: 'grid',
  })

  // Piutang table
  let y = doc.lastAutoTable.finalY + 10
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('PIUTANG (Yang Harus Diterima)', 14, y)

  autoTable(doc, {
    startY: y + 5,
    head: [['Nama', 'Keterangan', 'Jumlah', 'Jatuh Tempo', 'Status']],
    body: receivable.map(d => [d.name, d.description, formatCurrency(d.amount), formatShortDate(d.dueDate), d.status === 'paid' ? 'Lunas' : 'Belum Lunas']),
    headStyles: { fillColor: [16, 185, 129], textColor: 255 },
    styles: { fontSize: 9 },
  })

  // Hutang table
  y = doc.lastAutoTable.finalY + 10
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('HUTANG (Yang Harus Dibayar)', 14, y)

  autoTable(doc, {
    startY: y + 5,
    head: [['Nama', 'Keterangan', 'Jumlah', 'Jatuh Tempo', 'Status']],
    body: payable.map(d => [d.name, d.description, formatCurrency(d.amount), formatShortDate(d.dueDate), d.status === 'paid' ? 'Lunas' : 'Belum Lunas']),
    headStyles: { fillColor: [239, 68, 68], textColor: 255 },
    styles: { fontSize: 9 },
  })

  addFooter(doc)
  doc.save(`Laporan_HutangPiutang_3KA25_${new Date().toISOString().split('T')[0]}.pdf`)
}

export function exportRekapToPDF(rekapAnggota) {
  const doc = new jsPDF()
  const startY = addLetterhead(doc, 'Laporan Rekapitulasi Saldo Anggota')

  let totalSetoran = 0
  let totalPenarikan = 0
  let totalSaldo = 0

  const tableData = rekapAnggota.map((m, i) => {
    totalSetoran += m.totalBayar
    totalPenarikan += m.totalTarik
    totalSaldo += m.saldo
    return [
      i + 1,
      m.nama,
      formatCurrency(m.totalBayar),
      formatCurrency(m.totalTarik),
      formatCurrency(m.saldo)
    ]
  })

  tableData.push([
    '',
    'TOTAL KESELURUHAN',
    formatCurrency(totalSetoran),
    formatCurrency(totalPenarikan),
    formatCurrency(totalSaldo)
  ])

  autoTable(doc, {
    startY: startY + 5,
    head: [['No', 'Nama Anggota', 'Total Setoran', 'Total Penarikan', 'Sisa Saldo Kas']],
    body: tableData,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [79, 70, 229], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 60 },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 40, halign: 'right' },
      4: { cellWidth: 35, halign: 'right' }
    },
    didParseCell(data) {
      if (data.row.index === tableData.length - 1 && data.section === 'body') {
        data.cell.styles.fontStyle = 'bold'
        data.cell.styles.fillColor = [245, 245, 255]
      }
    }
  })

  addFooter(doc)
  doc.save(`Rekap_Anggota_3KA25_${new Date().toISOString().split('T')[0]}.pdf`)
}
