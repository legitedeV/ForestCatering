import type { CollectionBeforeChangeHook } from 'payload'

export const generateOrderNumber: CollectionBeforeChangeHook = async ({
  data,
  operation,
}) => {
  if (operation === 'create') {
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const rand = Math.floor(1000 + Math.random() * 9000)
    data.orderNumber = `FC-${dateStr}-${rand}`
  }
  return data
}
