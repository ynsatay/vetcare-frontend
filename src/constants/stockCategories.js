export const getStockCategories = (t) => [
  { label: t('Medicine'), value: 1 },
  { label: t('Consumable'), value: 2 },
  { label: t('Cleaning'), value: 3 },
  { label: t('Food'), value: 4 },
  { label: t('Vaccine'), value: 5 },
  { label: t('Other'), value: 6 },
];

// Backward-compat: older records may store "Other" as 0.
// We normalize to the new enum where "Other" is 6.
export const normalizeStockCategory = (value) => {
  if (value === null || value === undefined || value === '') return value;
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return value;
  return numericValue === 0 ? 6 : numericValue;
};
