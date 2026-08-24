export const getPriceForVariant = (basePrice: any, variant: string) => {
  if (typeof basePrice === 'object' && basePrice !== null) {
    if (basePrice[variant]) return Number(basePrice[variant]);
    return Number(Object.values(basePrice)[0]) || 0;
  }

  const numPrice = Number(basePrice);
  if (numPrice === 80) { // 200g base price (Urad Dal Papad)
    if (variant === '400g') return 160;
    if (variant === '500g') return 200;
    if (variant === '1kg') return 400;
    return numPrice;
  }
  
  if (variant === '500g') return numPrice * 2;
  if (variant === '1kg') return numPrice * 4;
  
  return numPrice;
}
