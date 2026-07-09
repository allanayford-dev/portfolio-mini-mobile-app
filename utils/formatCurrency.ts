const zarCurrency = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
  maximumFractionDigits: 0,
});

export function formatCurrency(value: number): string {
  return zarCurrency.format(value);
}
