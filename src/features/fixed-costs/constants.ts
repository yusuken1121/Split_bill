export const FIXED_COST_KINDS = ["rent", "electric", "gas", "water", "wifi"] as const;
export type FixedCostKind = (typeof FIXED_COST_KINDS)[number];

export const BIMONTHLY_KINDS: readonly FixedCostKind[] = ["gas", "water"];

export const RENT_PRICE = 113_340;

export const FIXED_COST_DEFAULTS = {
  whose: "both",
  status: "Done",
  whoPaid: "Y",
} as const;

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export const KIND_LABELS: Record<FixedCostKind, string> = {
  rent: "Rent",
  electric: "Electric",
  wifi: "Wi-Fi",
  gas: "Gas",
  water: "Water",
};

export const KIND_URLS: Partial<Record<FixedCostKind, string>> = {
  gas: "https://katene.jp/",
  electric: "https://terasel.my.site.com/elsCustomer",
  water: "https://www.suidoapp.waterworks.metro.tokyo.lg.jp/#/login",
  wifi: "https://my.ymobile.jp/",
};
