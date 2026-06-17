import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export async function uploadSlipImage(base64DataUrl: string): Promise<string> {
  const result = await cloudinary.uploader.upload(base64DataUrl, {
    folder: 'make_payment/slips',
    resource_type: 'image',
  })
  return result.secure_url
}
