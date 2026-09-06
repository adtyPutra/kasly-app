import { supabase } from '../lib/supabase.js'

export async function uploadProofFile(file, prefix = 'transfer') {
  if (!file) return { success: false, message: 'Tidak ada file yang dipilih' }
  
  // Validasi tipe file
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
  if (!allowedTypes.includes(file.type)) {
    return { success: false, message: 'Format file tidak didukung. Harap unggah gambar (JPG, PNG) atau PDF.' }
  }
  
  // Batas ukuran 2MB
  if (file.size > 2 * 1024 * 1024) {
    return { success: false, message: 'Ukuran file maksimal 2MB.' }
  }

  // Buat nama unik untuk file
  const fileExt = file.name.split('.').pop()
  const fileName = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`
  const filePath = `${fileName}`
  
  try {
    const { error: uploadError } = await supabase.storage
      .from('buktitransfer')
      .upload(filePath, file)
      
    if (uploadError) {
      throw uploadError
    }
    
    // Dapatkan public URL
    const { data } = supabase.storage
      .from('buktitransfer')
      .getPublicUrl(filePath)
      
    return { success: true, url: data.publicUrl }
  } catch (error) {
    return { success: false, message: error.message }
  }
}
