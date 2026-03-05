/**
 * Convert grosz (integer) to PLN formatted string.
 * Example: 1500 → "15,00 zł"
 */
export function formatPrice(grosz: number): string {
  const zloty = grosz / 100;
  return `${zloty.toFixed(2).replace('.', ',')} zł`;
}

/**
 * Format a date to Polish locale string.
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format a Polish phone number.
 * Example: "123456789" → "+48 123 456 789"
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');

  // Strip leading country code if present
  const local = digits.startsWith('48') && digits.length >= 11
    ? digits.slice(2)
    : digits;

  if (local.length !== 9) return phone;

  return `+48 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6, 9)}`;
}
