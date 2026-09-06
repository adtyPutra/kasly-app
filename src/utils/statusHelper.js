// statusHelper.js

/**
 * Sort periods ascending by year and month
 */
export function sortPeriods(periods) {
  return [...periods].sort((a, b) => {
    if (a.tahun !== b.tahun) return a.tahun - b.tahun;
    return a.bulan - b.bulan;
  });
}

/**
 * Get payment record for a specific member and period
 */
export function getPaymentForPeriod(memberId, periodId, allPayments) {
  return allPayments.find(p => p.anggota_id === memberId && p.periode_kas_id === periodId);
}

/**
 * Calculate arrears (tunggakan) for a member relative to a target period.
 * Arrears are unpaid periods that come STRICTLY BEFORE the target period.
 */
export function getArrears(memberId, targetPeriodId, allPeriods, allPayments) {
  const sortedPeriods = sortPeriods(allPeriods);
  const targetIndex = sortedPeriods.findIndex(p => p.id === targetPeriodId);
  
  if (targetIndex === -1) return { count: 0, total: 0, periods: [] };

  const pastPeriods = sortedPeriods.slice(0, targetIndex);
  const unpaidPastPeriods = pastPeriods.filter(p => !getPaymentForPeriod(memberId, p.id, allPayments));

  const total = unpaidPastPeriods.reduce((sum, p) => sum + (p.nominal || 0), 0);
  
  return {
    count: unpaidPastPeriods.length,
    total,
    periods: unpaidPastPeriods
  };
}

/**
 * Get all unpaid periods for a member
 */
export function getAllUnpaidPeriods(memberId, allPeriods, allPayments) {
  const sortedPeriods = sortPeriods(allPeriods);
  return sortedPeriods.filter(p => !getPaymentForPeriod(memberId, p.id, allPayments));
}

/**
 * Determine payment status for a specific period.
 * Returns: 'sudah', 'telat', 'belum'
 */
export function getPaymentStatus(memberId, period, allPayments) {
  if (!period) return { status: 'belum', payment: null };
  
  const payment = getPaymentForPeriod(memberId, period.id, allPayments);
  if (!payment) return { status: 'belum', payment: null };

  // Check late payment (comparing tanggal_bayar with batas_pembayaran)
  if (period.batas_pembayaran && payment.tanggal_bayar) {
    const batasDate = new Date(new Date(period.batas_pembayaran).setHours(0,0,0,0)).getTime();
    const bayarDate = new Date(new Date(payment.tanggal_bayar).setHours(0,0,0,0)).getTime();
    if (bayarDate > batasDate) {
      return { status: 'telat', payment };
    }
  }

  return { status: 'sudah', payment };
}

export function formatStatusLabel(status) {
  switch (status) {
    case 'sudah': return 'Sudah Bayar';
    case 'telat': return 'Telat Bayar';
    case 'belum': return 'Belum Bayar';
    default: return 'Belum Bayar';
  }
}
