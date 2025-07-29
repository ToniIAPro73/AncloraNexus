    // frontend/src/components/CreditSystem/types.ts

export interface CreditHistoryEntry {
  date: string;
  description: string;
  amount: number;
}

export type CreditContextType = {
  creditBalance: number;
  creditHistory: CreditHistoryEntry[];
  calculateCost: (fileType: string, fileSize: number, quality: string) => number;
};
