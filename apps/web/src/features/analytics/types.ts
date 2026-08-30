/**
 * Shared analytics snapshot shape (safe for client + server).
 */

export type AnalyticsSnapshot = {
  orderCount: number;
  cancelledCount: number;
  revenueIqd: number;
  byStatus: Array<{ status: string; count: number }>;
  topProducts: Array<{ name: string; quantity: number; revenueIqd: number }>;
};
