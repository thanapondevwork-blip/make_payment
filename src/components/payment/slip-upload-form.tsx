'use client'

import { useState, useRef, useTransition } from 'react'
import { Upload, CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  verifySlipByImage,
  submitPayment,
  uploadSlipToCloudinary,
} from '@/app/actions/payment'
import type { EasySlipVerifyData } from '@/lib/easyslip'

function fmt(amount: number) {
  return new Intl.NumberFormat('th-TH').format(amount)
}

function fmtDate(dateStr: string) {
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

export function SlipUploadForm() {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [verifyResult, setVerifyResult] = useState<EasySlipVerifyData | null>(null)
  const [verifyError, setVerifyError] = useState<string | null>(null)
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null)
  const [isVerifying, startVerify] = useTransition()
  const [isSubmitting, startSubmit] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetVerify = () => {
    setVerifyResult(null)
    setVerifyError(null)
    setSubmitResult(null)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setImageFile(file)
    resetVerify()
    if (!file) {
      setImagePreview(null)
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleVerify = () => {
    if (!imageFile) return
    resetVerify()
    startVerify(async () => {
      const fd = new FormData()
      fd.append('image', imageFile)
      const result = await verifySlipByImage(fd)
      if (result.success) {
        setVerifyResult(result.data)
      } else {
        setVerifyError(result.error.message)
      }
    })
  }

  const handleSubmit = () => {
    if (!verifyResult) return
    startSubmit(async () => {
      let slipImageUrl: string | undefined
      if (imageFile) {
        const fd = new FormData()
        fd.append('image', imageFile)
        const upload = await uploadSlipToCloudinary(fd)
        if (upload.success) slipImageUrl = upload.url
      }
      const result = await submitPayment(verifyResult, slipImageUrl)
      setSubmitResult(result)
      if (result.success) {
        setImageFile(null)
        setImagePreview(null)
        setVerifyResult(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    })
  }

  const canVerify = !!imageFile
  const accountMatched = !!verifyResult?.matchedAccount

  return (
    <div className="bg-card rounded-2xl border border-border p-6 space-y-5 shadow-sm">
      <h2 className="text-base font-semibold text-foreground">แนบสลิปชำระเงิน</h2>

      {/* Image upload area */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleImageChange}
          className="hidden"
          id="slip-image-input"
        />
        <label
          htmlFor="slip-image-input"
          className="flex flex-col items-center justify-center w-full min-h-40 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-violet-500/60 hover:bg-violet-950/20 transition-all duration-200 overflow-hidden"
        >
          {imagePreview ? (
            <img src={imagePreview} alt="slip preview" className="w-full max-h-64 object-contain p-2" />
          ) : (
            <div className="flex flex-col items-center gap-2 p-8 text-muted-foreground">
              <Upload className="size-8" />
              <span className="text-sm font-medium">คลิกเพื่อเลือกรูปสลิป</span>
              <span className="text-xs">JPEG, PNG, WebP — สูงสุด 4MB</span>
            </div>
          )}
        </label>
      </div>

      {/* Verify button */}
      <Button onClick={handleVerify} disabled={!canVerify || isVerifying || !!verifyResult} className="w-full" size="lg">
        {isVerifying ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            กำลังตรวจสอบสลิป...
          </>
        ) : (
          'ตรวจสอบสลิป'
        )}
      </Button>

      {/* Error */}
      {verifyError && (
        <div className="flex items-start gap-2.5 p-3.5 bg-red-950/30 border border-red-800/50 rounded-lg text-sm text-red-400">
          <XCircle className="size-4 mt-0.5 shrink-0" />
          <span>{verifyError}</span>
        </div>
      )}

      {/* Verify result card */}
      {verifyResult && (
        <div
          className={`rounded-xl border p-4 space-y-4 ${
            verifyResult.isDuplicate || !accountMatched
              ? verifyResult.isDuplicate
                ? 'bg-amber-950/30 border-amber-800/50'
                : 'bg-red-950/30 border-red-800/50'
              : 'bg-emerald-950/30 border-emerald-800/50'
          }`}
        >
          {/* Status header */}
          <div className="flex items-center gap-2">
            {verifyResult.isDuplicate ? (
              <>
                <AlertTriangle className="size-4 text-amber-400 shrink-0" />
                <span className="text-sm font-semibold text-amber-300">
                  สลิปซ้ำ — ไม่สามารถบันทึกได้
                </span>
              </>
            ) : !accountMatched ? (
              <>
                <XCircle className="size-4 text-red-400 shrink-0" />
                <span className="text-sm font-semibold text-red-400">
                  บัญชีผู้รับไม่ตรง — ไม่สามารถบันทึกได้
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                <span className="text-sm font-semibold text-emerald-300">
                  ตรวจสอบสลิปสำเร็จ — บัญชีถูกต้อง
                </span>
              </>
            )}
          </div>

          {/* Account mismatch warning */}
          {!accountMatched && !verifyResult.isDuplicate && (
            <div className="text-xs text-red-400 bg-red-950/30 rounded-lg p-2.5 leading-relaxed">
              สลิปนี้โอนเงินไปยังบัญชีอื่น ไม่ใช่บัญชีที่ลงทะเบียนไว้<br />
              กรุณาโอนเงินมาที่บัญชีที่ถูกต้องแล้วอัปโหลดสลิปใหม่
            </div>
          )}

          {/* Slip details */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">จำนวนเงิน</p>
              <p className="font-semibold text-foreground text-base">
                {fmt(verifyResult.amountInSlip)} บาท
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">วันที่โอน</p>
              <p className="font-medium text-foreground text-xs">
                {fmtDate(verifyResult.rawSlip.date)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">ผู้โอน</p>
              <p className="font-medium text-foreground text-xs truncate">
                {verifyResult.rawSlip.sender.account.name.th ??
                  verifyResult.rawSlip.sender.account.name.en ??
                  '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">ธนาคารผู้โอน</p>
              <p className="font-medium text-foreground text-xs">
                {verifyResult.rawSlip.sender.bank.name}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">ผู้รับ</p>
              <p className="font-medium text-foreground text-xs truncate">
                {verifyResult.rawSlip.receiver.account.name.th ??
                  verifyResult.rawSlip.receiver.account.name.en ??
                  '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">ธนาคารผู้รับ</p>
              <p className="font-medium text-foreground text-xs">
                {verifyResult.rawSlip.receiver.bank.name}
              </p>
            </div>
          </div>

          {/* Transaction ref */}
          <p className="text-xs text-muted-foreground font-mono truncate">
            Ref: {verifyResult.rawSlip.transRef}
          </p>

          {/* Confirm button */}
          {!verifyResult.isDuplicate && accountMatched && (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !!submitResult?.success}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                'ยืนยันบันทึกการชำระเงิน'
              )}
            </Button>
          )}
        </div>
      )}

      {/* Submit result */}
      {submitResult && (
        <div
          className={`flex items-start gap-2.5 p-3.5 rounded-lg border text-sm ${
            submitResult.success
              ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300'
              : 'bg-red-950/30 border-red-800/50 text-red-400'
          }`}
        >
          {submitResult.success ? (
            <CheckCircle2 className="size-4 mt-0.5 shrink-0" />
          ) : (
            <XCircle className="size-4 mt-0.5 shrink-0" />
          )}
          <span>{submitResult.message}</span>
        </div>
      )}
    </div>
  )
}
