import { uploadSlipImage as uploadToCloudinary } from './cloudinary'
import { uploadSlipImageToSupabase } from './supabase-storage'

export async function uploadSlipImage(base64DataUrl: string): Promise<string> {
  if (process.env.STORAGE_PROVIDER === 'supabase') {
    return uploadSlipImageToSupabase(base64DataUrl)
  }
  return uploadToCloudinary(base64DataUrl)
}
