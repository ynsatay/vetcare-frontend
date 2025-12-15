export const getServiceCategories = (t) => [
  { label: t('Examination'), value: 1 },
  { label: t('Vaccination'), value: 2 },
  { label: t('Operation'), value: 3 },
  { label: t('Treatment'), value: 4 },
  { label: t('Other'), value: 0 },
];

export const normalizeServiceCategory = (value) => {
  if (value === null || value === undefined || value === '') return value;
  const numericValue = Number(value);
  return Number.isNaN(numericValue) ? value : numericValue;
};
