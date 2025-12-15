export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: 'UDHAAR' | 'JAMA'; // Udhaar = Credit (Given), Jama = Debit (Received)
  description: string;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  transactions: Transaction[];
}

export interface FinanceEntry {
  id: string;
  date: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  description: string;
}

export type OrderStatus = 'PENDING' | 'IN_PROCESS' | 'COMPLETED';

export interface WorkOrder {
  id: string;
  date: string;
  customerId: string; // Links to Customer
  customerName: string; // Snapshot in case customer is deleted/adhoc
  detail: string;
  status: OrderStatus;
  amount: number;
  advance: number; // Jma associated with this order
}

export interface ShopSettings {
  shopName: string;
  ownerName: string;
  contactNumber: string;
  address: string;
  dataFolderPath?: string; // New field for custom save location
}

export interface AppState {
  customers: Customer[];
  finances: FinanceEntry[];
  orders: WorkOrder[];
  settings: ShopSettings;
}