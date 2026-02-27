import { NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload-client'
import { dotpayConfig, sha256 } from '@/lib/payments'

function normalize(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

export async function POST(req: Request) {
  try {
    const body = await req.formData().catch(async () => {
      const json = await req.json().catch(() => ({}))
      const form = new FormData()
      Object.entries(json).forEach(([key, value]) => form.set(key, String(value)))
      return form
    })

    const control = normalize(body.get('control'))
    const operationNumber = normalize(body.get('operation_number') || body.get('t_id'))
    const amount = normalize(body.get('operation_amount') || body.get('amount'))
    const currency = normalize(body.get('operation_currency') || body.get('currency') || 'PLN')
    const operationStatus = normalize(body.get('operation_status') || body.get('t_status'))
    const signature = normalize(body.get('signature') || body.get('chk'))

    if (!control) {
      return NextResponse.json({ error: 'Missing control' }, { status: 400 })
    }

    const cfg = dotpayConfig()
    const expected = sha256(`${cfg.pin}${control}${operationNumber}${amount}${currency}${operationStatus}`)
    if (!signature || (signature !== expected && signature !== cfg.pin)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const cms = await getPayload()
    const found = await cms.find({
      collection: 'orders',
      where: { paymentSessionId: { equals: control } },
      limit: 1,
      overrideAccess: true,
    })

    const order = found.docs[0]
    if (!order) return NextResponse.json({ ok: true })
    if (order.status === 'paid') return NextResponse.json({ ok: true, idempotent: true })

    const isPaid = operationStatus.toLowerCase() === 'completed'

    await cms.update({
      collection: 'orders',
      id: order.id,
      overrideAccess: true,
      data: {
        status: isPaid ? 'paid' : 'failed',
        paymentStatus: isPaid ? 'paid' : 'unpaid',
        transactionId: operationNumber,
        paymentMeta: {
          ...(typeof order.paymentMeta === 'object' && order.paymentMeta ? order.paymentMeta : {}),
          dotpayWebhook: Object.fromEntries(body.entries()),
        },
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[DOTPAY WEBHOOK] Error:', error)
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}
