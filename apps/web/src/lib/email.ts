import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<void> {
  if (!to) {
    console.warn('sendEmail: no recipient address provided, skipping')
    return
  }

  if (!process.env.SMTP_HOST) {
    console.log('--- EMAIL (console fallback) ---')
    console.log(`To: ${to}`)
    console.log(`Subject: ${subject}`)
    console.log(`Body: ${html}`)
    console.log('--- END EMAIL ---')
    return
  }

  try {
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    await transport.sendMail({
      from: process.env.SMTP_FROM || 'kontakt@forestcatering.pl',
      to,
      subject,
      html,
    })
  } catch (error) {
    console.error('[Email] SMTP send failed:', error)
  }
}
