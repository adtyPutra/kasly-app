import Swal from 'sweetalert2'

export function showDangerConfirm(title, text) {
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: '<span style="color:#ef4444;font-weight:bold;">Ya</span>',
    cancelButtonText: '<span style="color:#ffffff;">Batal</span>',
    background: '#ef4444', 
    color: '#ffffff', 
    iconColor: '#ffffff', 
    confirmButtonColor: '#ffffff',
    cancelButtonColor: '#b91c1c',
    reverseButtons: true
  }).then(result => result.isConfirmed)
}

export function showStandardConfirm(title, text) {
  return Swal.fire({
    title,
    text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Ya',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#10b981',
    cancelButtonColor: '#6b7280',
    reverseButtons: true
  }).then(result => result.isConfirmed)
}
