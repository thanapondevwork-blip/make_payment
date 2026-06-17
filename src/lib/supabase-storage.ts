import { supabase } from '@/utils/supabase'

export async function uploadSlipImageToSupabase(base64DataUrl: string): Promise<string> {
  const matches = base64DataUrl.match(/^data:([A-Za-z-+/]+);base64,(.+)$/)
  if (!matches) throw new Error('Invalid base64 data URL')

  const mimeType = matches[1]
  const buffer = Buffer.from(matches[2], 'base64')
  const ext = mimeType.split('/')[1] ?? 'jpg'
  const fileName = `slips/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const bucket = process.env.SUPABASE_STORAGE_BUCKET!

  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, buffer, { contentType: mimeType, upsert: false, cacheControl: "31536000" })

  if (error) throw new Error(`Supabase Storage upload failed: ${error.message}`)

  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName)
  return data.publicUrl
}
