export interface EasySlipBank {
  id?: string
  name: string
  short: string
  nameTh?: string
  nameEn?: string
  code?: string
  shortCode?: string
}

export interface EasySlipAccount {
  name: { th?: string; en?: string }
  bank?: { type: 'BANKAC' | 'TOKEN' | 'DUMMY'; account: string }
  proxy?: { type: 'NATID' | 'MSISDN' | 'EWALLETID' | 'EMAIL' | 'BILLERID'; account: string }
}

export interface EasySlipParty {
  bank: EasySlipBank
  account: EasySlipAccount
  merchantId?: string | null
}

export interface EasySlipRawSlip {
  payload: string
  transRef: string
  date: string
  countryCode: string
  amount: {
    amount: number
    local: { amount: number; currency: string }
  }
  fee: number
  ref1: string
  ref2: string
  ref3: string
  sender: EasySlipParty
  receiver: EasySlipParty
}

export interface EasySlipMatchedAccount {
  bank: { nameTh: string; nameEn: string; code: string; shortCode: string }
  nameTh: string
  nameEn: string
  type: 'PERSONAL' | 'JURISTIC'
  bankNumber: string
}

export interface EasySlipVerifyData {
  remark?: string
  isDuplicate: boolean
  matchedAccount: EasySlipMatchedAccount | null
  amountInOrder?: number
  amountInSlip: number
  isAmountMatched?: boolean
  rawSlip: EasySlipRawSlip
}

export interface EasySlipVerifyResponse {
  success: true
  data: EasySlipVerifyData
  message: string
}

export interface EasySlipErrorResponse {
  success: false
  error: { code: string; message: string }
}

export type EasySlipResponse = EasySlipVerifyResponse | EasySlipErrorResponse

export interface EasySlipInfoData {
  application: {
    name: string
    autoRenew: {
      expired: boolean
      quota: boolean
      createdAt: string
      expiresAt: string
    }
    quota: {
      used: number
      max: number | null
      remaining: number | null
      totalUsed: number
    }
  }
  branch: {
    name: string
    isActive: boolean
    quota: { used: number; totalUsed: number }
  }
  account: { email: string; credit: number }
  product: { name: string }
}

export interface EasySlipInfoResponse {
  success: true
  data: EasySlipInfoData
  message: string
}
