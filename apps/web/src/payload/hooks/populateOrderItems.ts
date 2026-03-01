import type { CollectionBeforeChangeHook } from 'payload'

interface OrderItem {
  product?: number | string | { id: number | string } | null
  productName?: string
  quantity?: number
  unitPrice?: number
  lineTotal?: number
  [key: string]: unknown
}

function calcLineTotal(item: OrderItem): void {
  if (item.quantity && item.unitPrice) {
    item.lineTotal = item.quantity * item.unitPrice
  }
}

export const populateOrderItems: CollectionBeforeChangeHook = async ({ data, req }) => {
  if (!Array.isArray(data.items) || data.items.length === 0) {
    return data
  }

  const processedItems = await Promise.all(
    data.items.map(async (item: OrderItem) => {
      const productRef = item.product

      if (!productRef) {
        // Manual entry — recalculate lineTotal if quantity and unitPrice are present
        calcLineTotal(item)
        return item
      }

      // Resolve product ID (may already be a populated object or just an ID)
      const productId =
        typeof productRef === 'object' && productRef !== null && 'id' in productRef
          ? productRef.id
          : (productRef as number | string)

      try {
        const product = await req.payload.findByID({
          collection: 'products',
          id: productId,
          overrideAccess: true,
        })

        if (!item.productName) {
          item.productName = product.name
        }
        if (!item.unitPrice) {
          item.unitPrice = product.price
        }
        if (!item.quantity) {
          item.quantity = 1
        }

        calcLineTotal(item)
      } catch {
        // Product not found — fall back to manual values
        calcLineTotal(item)
      }

      return item
    }),
  )

  data.items = processedItems

  const subtotal = processedItems.reduce((sum: number, item: OrderItem) => {
    return sum + (item.lineTotal || 0)
  }, 0)

  data.subtotal = subtotal
  data.total = subtotal + ((data.deliveryFee as number) || 0)

  return data
}
