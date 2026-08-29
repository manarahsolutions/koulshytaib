/**
 * In-memory loyalty repository.
 * Not persisted — replace with API / DB later.
 */

import type {
  LoyaltyAccount,
  LoyaltyTransaction,
} from "@/features/loyalty/types";

export type LoyaltyRepository = {
  getAccount: (customerId: string) => LoyaltyAccount | null;
  listAccounts: () => LoyaltyAccount[];
  saveAccount: (account: LoyaltyAccount) => void;
  listTransactions: (customerId: string) => LoyaltyTransaction[];
  listAllTransactions: () => LoyaltyTransaction[];
  addTransaction: (transaction: LoyaltyTransaction) => void;
  clear: () => void;
  subscribe: (onStoreChange: () => void) => () => void;
  getRevision: () => number;
};

export function createInMemoryLoyaltyRepository(): LoyaltyRepository {
  const accounts = new Map<string, LoyaltyAccount>();
  const transactions: LoyaltyTransaction[] = [];
  const listeners = new Set<() => void>();
  let revision = 0;

  const emit = () => {
    revision += 1;
    listeners.forEach((l) => l());
  };

  return {
    getAccount: (customerId) => accounts.get(customerId) ?? null,
    listAccounts: () => Array.from(accounts.values()),
    saveAccount: (account) => {
      accounts.set(account.customerId, account);
      emit();
    },
    listTransactions: (customerId) =>
      transactions.filter((t) => t.customerId === customerId),
    listAllTransactions: () => [...transactions],
    addTransaction: (transaction) => {
      transactions.push(transaction);
      emit();
    },
    clear: () => {
      accounts.clear();
      transactions.length = 0;
      emit();
    },
    subscribe: (onStoreChange) => {
      listeners.add(onStoreChange);
      return () => {
        listeners.delete(onStoreChange);
      };
    },
    getRevision: () => revision,
  };
}

export const loyaltyRepository: LoyaltyRepository =
  createInMemoryLoyaltyRepository();

export function subscribeLoyalty(onStoreChange: () => void): () => void {
  return loyaltyRepository.subscribe(onStoreChange);
}

export function getLoyaltyRevision(): number {
  return loyaltyRepository.getRevision();
}

/** Replace loyalty client cache from DB hydrate. */
export function replaceLoyaltyFromServer(input: {
  accounts: LoyaltyAccount[];
  transactions: LoyaltyTransaction[];
}): void {
  loyaltyRepository.clear();
  for (const account of input.accounts) {
    loyaltyRepository.saveAccount({ ...account });
  }
  for (const txn of input.transactions) {
    loyaltyRepository.addTransaction({ ...txn });
  }
}
