export function formatPrice(grosze: number): string {
  const zloty = Math.floor(grosze / 100)
  const groszePart = grosze % 100
  return `${zloty},${groszePart.toString().padStart(2, '0')} zł`
}
