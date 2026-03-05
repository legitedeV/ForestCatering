interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  // TODO: Replace with SMTP transport (e.g. nodemailer) in production
  console.log('[Email] Sending email:', {
    to: options.to,
    subject: options.subject,
    from: options.from ?? 'noreply@forestcatering.pl',
  });

  return true;
}
