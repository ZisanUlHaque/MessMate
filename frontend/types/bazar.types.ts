export interface BazarItem {
  id?: string;
  itemName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface BazarUser {
  id: string;
  fullName: string;
}

export interface Bazar {
  id: string;
  messId: string;
  addedBy: string;
  date: string;
  totalAmount: number;
  category: "GROCERY" | "GAS" | "UTILITY" | "OTHER";
  receiptUrl: string | null;
  description: string | null;
  createdAt: string;
  items?: BazarItem[];
  addedByUser?: BazarUser;
}

export interface BazarCategorySummary {
  category: string;
  total: number;
}

export interface BazarSummary {
  categories: BazarCategorySummary[];
  grandTotal: number;
}
