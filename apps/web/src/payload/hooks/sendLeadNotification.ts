import type { CollectionAfterChangeHook } from 'payload'
import { sendEmail } from '../../lib/email'

export const sendLeadNotificationToAdmin: CollectionAfterChangeHook = async ({
  doc,
  operation,
}) => {
  if (operation === 'create') {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@forestcatering.pl'

    await sendEmail({
      to: adminEmail,
      subject: `Nowy lead: ${doc.name}`,
      html: `
        <h1>Nowy formularz kontaktowy</h1>
        <p><strong>Imię:</strong> ${doc.name}</p>
        <p><strong>Email:</strong> ${doc.email}</p>
        <p><strong>Typ wydarzenia:</strong> ${doc.eventType || 'Nie podano'}</p>
        <p><strong>Wiadomość:</strong></p>
        <p>${doc.message}</p>
      `,
    })
  }
}
