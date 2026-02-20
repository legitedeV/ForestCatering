import type { CollectionAfterChangeHook } from 'payload'
import { sendEmail } from '../../lib/email'
import { formatPrice } from '../../lib/format'

export const sendOrderConfirmationEmail: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
}) => {
  const customerEmail = doc.customer?.email
  if (!customerEmail) return

  try {
    if (operation === 'create') {
      const itemsHtml = doc.items
        ?.map(
          (item: { productName: string; quantity: number; lineTotal: number }) =>
            `<li>${item.productName} x${item.quantity} — ${formatPrice(item.lineTotal)}</li>`,
        )
        .join('')

      await sendEmail({
        to: customerEmail,
        subject: `Potwierdzenie zamówienia ${doc.orderNumber}`,
        html: `
          <h1>Dziękujemy za zamówienie!</h1>
          <p>Numer zamówienia: <strong>${doc.orderNumber}</strong></p>
          <ul>${itemsHtml}</ul>
          <p><strong>Razem: ${formatPrice(doc.total)}</strong></p>
        `,
      })
    }

    if (operation === 'update' && previousDoc?.status !== doc.status) {
      await sendEmail({
        to: customerEmail,
        subject: `Aktualizacja zamówienia ${doc.orderNumber}`,
        html: `
          <h1>Status zamówienia został zmieniony</h1>
          <p>Numer zamówienia: <strong>${doc.orderNumber}</strong></p>
          <p>Nowy status: <strong>${doc.status}</strong></p>
        `,
      })
    }
  } catch (error) {
    console.error('[Email] Failed to send order email:', error)
  }
}
