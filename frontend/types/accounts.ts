export interface Account {
  id: string;
  name: string;
  type: string;
  subtype: string;
  institution: string;
  balance: number;
  last_updated: string;

  // Checking/Savings specific
  available_balance?: number;

  // Credit specific
  credit_limit?: number;

  // Investment specific
  holdings_value?: number;
}

export interface Transaction {
  id: string;
  account_id: string;
  date: string;
  description: string;
  amount: number;
  category?: string;
}

export interface Holding {
  id: string;
  account_id: string;
  security_id: string;
  name: string;
  ticker?: string;
  quantity: number;
  price: number;
  value: number;
  cost_basis?: number;
  last_updated: string;
}