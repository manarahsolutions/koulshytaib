/**
 * Loyalty reward catalog types — client-safe.
 */

export type LoyaltyRewardRecord = {
  id: string;
  title: string;
  description?: string;
  pointsCost: number;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};
