import Stripe from 'stripe';

export interface IMetrics {
  totalAmountSpent: number;
  averageTransactionAmount: number;
  transactionsGroupedByCategory: Record<string, number>;
  numberOfTransactions: number;
}

export interface IMetricsTransactions {
  metrics: IMetrics;
  transactionsList: Stripe.Issuing.Transaction[];
}

export interface Identifiable {
  id: string;
}

export type TypeListParams =
  | Stripe.Issuing.TransactionListParams
  | Stripe.Issuing.AuthorizationListParams;
