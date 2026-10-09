export interface BillUser {
  id: string;
  fullName: string;
}

export interface Bill {
  id: string;
  messId: string;
  userId: string;
  month: number;
  year: number;
  totalMeals: number;
  mealRate: number;
  totalBazarShare: number;
  fixedCostShare: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: "UNPAID" | "PARTIAL" | "PAID";
  generatedAt: string;
  user?: BillUser;
}

export interface Payment {
  id: string;
  billId: string;
  userId: string;
  amount: number;
  method: "CASH" | "BKASH" | "BANK";
  note: string | null;
  paidAt: string;
}

export interface ExtraEater {
  userId: string;
  fullName: string;
  totalMeals: number;
  averageMeals: number;
  deviation: number;
}
