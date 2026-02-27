import crypto from 'crypto'

export type PaymentProvider = 'p24' | 'dotpay'

function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required env: ${name}`)
  }
  return value
}

export function getSiteUrl(): string {
  return requiredEnv('SITE_URL').replace(/\/$/, '')
}

export function sha384(payload: string): string {
  return crypto.createHash('sha384').update(payload).digest('hex')
}

export function sha256(payload: string): string {
  return crypto.createHash('sha256').update(payload).digest('hex')
}

export function p24Config() {
  return {
    merchantId: Number(requiredEnv('P24_MERCHANT_ID')),
    posId: Number(requiredEnv('P24_POS_ID')),
    crc: requiredEnv('P24_CRC'),
    apiKey: requiredEnv('P24_API_KEY'),
    baseUrl: requiredEnv('P24_BASE_URL').replace(/\/$/, ''),
  }
}

export function dotpayConfig() {
  return {
    id: requiredEnv('DOTPAY_ID'),
    pin: requiredEnv('DOTPAY_PIN'),
    baseUrl: requiredEnv('DOTPAY_BASE_URL').replace(/\/$/, ''),
  }
}

export function toMinorUnits(amount: number): number {
  return Math.round(amount)
}

export function formatMajorFromMinor(minor: number): string {
  return (minor / 100).toFixed(2)
}
