export const PRICE_TIERS = [
  { key: "retail", label: "Khách lẻ", field: "retail_price" },
  { key: "wholesale", label: "Khách sỉ", field: "wholesale_price" },
  { key: "ctv", label: "Cộng tác viên", field: "ctv_price" },
];

export function tierField(tierKey) {
  const tier = PRICE_TIERS.find((t) => t.key === tierKey);
  return tier ? tier.field : "retail_price";
}

export function tierLabel(tierKey) {
  const tier = PRICE_TIERS.find((t) => t.key === tierKey);
  return tier ? tier.label : "Khách lẻ";
}

export function priceForTier(product, tierKey) {
  return product[tierField(tierKey)] ?? product.retail_price ?? 0;
}

export function formatVND(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}
