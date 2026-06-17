'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { uploadSlipImage } from '@/lib/storage'
import type {
  EasySlipResponse,
  EasySlipVerifyData,
  EasySlipInfoResponse,
} from '@/lib/easyslip'

const EASYSLIP_API_URL = 'https://api.easyslip.com/v2'
const TOTAL_DEBT_AMOUNT = 56000

async function getOrCreateDebt() {
  const existing = await prisma.debt.findFirst()
  if (existing) return existing
  return prisma.debt.create({
    data: {
      totalAmount: TOTAL_DEBT_AMOUNT,
      debtorName: 'ลูกหนี้',
      description: 'ยอดหนี้คงค้าง 56,000 บาท',
    },
  })
}

export async function getDebtInfo() {
  const debt = await getOrCreateDebt()
  const payments = await prisma.payment.findMany({
    where: { debtId: debt.id },
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { email: true } } },
  })
  const paidAmount = payments
    .filter((p) => p.status === 'APPROVED')
    .reduce((sum, p) => sum + p.amount, 0)
  return {
    debt,
    payments,
    paidAmount,
    remaining: debt.totalAmount - paidAmount,
    pendingCount: payments.filter((p) => p.status === 'PENDING').length,
  }
}

const payloadSchema = z.object({
  payload: z.string().min(1).max(128),
})

export async function verifySlipByPayload(payload: string): Promise<EasySlipResponse> {
  const { userId } = await auth()
  if (!userId) {
    return { success: false, error: { code: 'UNAUTHORIZED', message: 'กรุณาเข้าสู่ระบบก่อน' } }
  }

  const parsed = payloadSchema.safeParse({ payload })
  if (!parsed.success) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Payload ไม่ถูกต้อง (1-128 ตัวอักษร)' } }
  }

  const res = await fetch(`${EASYSLIP_API_URL}/verify/bank`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.EASYSLIP_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ payload, checkDuplicate: true, matchAccount: true }),
  })
  return res.json() as Promise<EasySlipResponse>
}

export async function verifySlipByImage(formData: FormData): Promise<EasySlipResponse> {
  const { userId } = await auth()
  if (!userId) {
    return { success: false, error: { code: 'UNAUTHORIZED', message: 'กรุณาเข้าสู่ระบบก่อน' } }
  }

  const image = formData.get('image') as File | null
  if (!image || image.size === 0) {
    return { success: false, error: { code: 'NO_IMAGE', message: 'กรุณาเลือกไฟล์รูปภาพ' } }
  }
  if (image.size > 4 * 1024 * 1024) {
    return { success: false, error: { code: 'IMAGE_TOO_LARGE', message: 'ไฟล์รูปใหญ่เกิน 4MB' } }
  }

  const arrayBuffer = await image.arrayBuffer()
  const base64 = Buffer.from(arrayBuffer).toString('base64')

  const res = await fetch(`${EASYSLIP_API_URL}/verify/bank`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.EASYSLIP_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      base64: `data:${image.type};base64,${base64}`,
      checkDuplicate: true,
      matchAccount: true,
    }),
  })
  return res.json() as Promise<EasySlipResponse>
}

export async function uploadSlipToCloudinary(
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'กรุณาเข้าสู่ระบบก่อน' }

  const image = formData.get('image') as File | null
  if (!image || image.size === 0) return { success: false, error: 'ไม่พบไฟล์รูปภาพ' }

  const arrayBuffer = await image.arrayBuffer()
  const base64 = Buffer.from(arrayBuffer).toString('base64')
  const dataUrl = `data:${image.type};base64,${base64}`

  const url = await uploadSlipImage(dataUrl)
  return { success: true, url }
}

export async function submitPayment(
  data: EasySlipVerifyData,
  slipImageUrl?: string
): Promise<{ success: boolean; message: string }> {
  const { userId } = await auth()
  if (!userId) {
    return { success: false, message: 'กรุณาเข้าสู่ระบบก่อน' }
  }

  const dbUser = await prisma.user.findUnique({ where: { id: userId } })
  if (!dbUser) {
    return { success: false, message: 'ไม่พบข้อมูลผู้ใช้ กรุณาลองใหม่' }
  }
  if (dbUser.isAdmin) {
    return { success: false, message: 'Admin ไม่สามารถชำระเงินได้' }
  }

  if (!data.matchedAccount) {
    return {
      success: false,
      message: 'สลิปนี้โอนเงินไปยังบัญชีอื่น ไม่ใช่บัญชีที่ลงทะเบียนไว้ กรุณาตรวจสอบบัญชีผู้รับให้ถูกต้อง',
    }
  }

  if (data.isDuplicate) {
    return { success: false, message: 'สลิปนี้เคยถูกใช้แล้ว ไม่สามารถชำระซ้ำได้' }
  }

  const debt = await getOrCreateDebt()
  const { rawSlip } = data

  const existing = await prisma.payment.findUnique({ where: { transRef: rawSlip.transRef } })
  if (existing) {
    return { success: false, message: 'สลิปนี้เคยถูกบันทึกแล้ว' }
  }

  await prisma.payment.create({
    data: {
      debtId: debt.id,
      userId,
      amount: rawSlip.amount.amount,
      transRef: rawSlip.transRef,
      senderBank: rawSlip.sender.bank.name,
      senderName: rawSlip.sender.account.name.th ?? rawSlip.sender.account.name.en,
      receiverBank: rawSlip.receiver.bank.name,
      receiverName: rawSlip.receiver.account.name.th ?? rawSlip.receiver.account.name.en,
      slipDate: new Date(rawSlip.date),
      isDuplicate: false,
      rawSlipData: data as object,
      remark: data.remark,
      status: 'PENDING',
      slipImageUrl: slipImageUrl ?? null,
    },
  })

  revalidatePath('/payment')
  return {
    success: true,
    message: `ส่งสลิป ${new Intl.NumberFormat('th-TH').format(rawSlip.amount.amount)} บาท สำเร็จ — รอ Admin อนุมัติ`,
  }
}

export async function approvePayment(
  paymentId: string
): Promise<{ success: boolean; message: string }> {
  const { userId } = await auth()
  if (!userId) return { success: false, message: 'กรุณาเข้าสู่ระบบก่อน' }

  const dbUser = await prisma.user.findUnique({ where: { id: userId } })
  if (!dbUser?.isAdmin) return { success: false, message: 'เฉพาะ Admin เท่านั้น' }

  const payment = await prisma.payment.findUnique({ where: { id: paymentId } })
  if (!payment) return { success: false, message: 'ไม่พบรายการชำระเงิน' }
  if (payment.status !== 'PENDING') return { success: false, message: 'รายการนี้ไม่ได้อยู่ในสถานะรอดำเนินการ' }

  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: 'APPROVED',
      approvedById: userId,
      approvedAt: new Date(),
    },
  })

  revalidatePath('/payment')
  return { success: true, message: 'อนุมัติการชำระเงินสำเร็จ' }
}

export async function rejectPayment(
  paymentId: string,
  reason?: string
): Promise<{ success: boolean; message: string }> {
  const { userId } = await auth()
  if (!userId) return { success: false, message: 'กรุณาเข้าสู่ระบบก่อน' }

  const dbUser = await prisma.user.findUnique({ where: { id: userId } })
  if (!dbUser?.isAdmin) return { success: false, message: 'เฉพาะ Admin เท่านั้น' }

  const payment = await prisma.payment.findUnique({ where: { id: paymentId } })
  if (!payment) return { success: false, message: 'ไม่พบรายการชำระเงิน' }
  if (payment.status !== 'PENDING') return { success: false, message: 'รายการนี้ไม่ได้อยู่ในสถานะรอดำเนินการ' }

  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: 'REJECTED',
      rejectedReason: reason ?? null,
    },
  })

  revalidatePath('/payment')
  return { success: true, message: 'ปฏิเสธการชำระเงินแล้ว' }
}

export async function getEasySlipInfo(): Promise<EasySlipInfoResponse | null> {
  try {
    const res = await fetch(`${EASYSLIP_API_URL}/info`, {
      headers: { Authorization: `Bearer ${process.env.EASYSLIP_API_KEY}` },
      cache: 'no-store',
    })
    return res.json()
  } catch {
    return null
  }
}
