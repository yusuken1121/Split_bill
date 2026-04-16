export type Payer = "Y" | "E" | null;
export type Whose = "both" | "Y" | "E";
export type Status = "Not bought" | "Done";

export interface ShoppingData {
  stuff: string;
  date: string;
  price?: number;
  status: Status;
  whoPaid: Payer;
  whose: Whose;
}

export interface QuickShoppingItem {
  name: string;
  icon: string;
}
