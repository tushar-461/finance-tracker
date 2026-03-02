export function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function toTitleCase(value = "") {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => `${word[0]?.toUpperCase()}${word.slice(1).toLowerCase()}`)
    .join(" ");
}
