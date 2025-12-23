export interface StockData {
  stockId: string;
  stockName?: string;
  date: Date;
  dateStr: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface TradeResult {
  year: number;
  buyDate: string;
  buyPrice: number;
  sellDate: string;
  sellPrice: number;
  profitPct: number;
  profitAbs: number;
  isWin: boolean;
  durationDays: number;
}

export interface BacktestStats {
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  avgProfit: number;
  totalReturn: number;
  bestTrade: number;
  worstTrade: number;
  sharpeRatio: number;
}

export interface StockSummary extends BacktestStats {
  stockId: string;
  stockName?: string;
  market?: string;
  industry?: string;
  weight?: string;
}

export interface StockMetadata {
  name: string;
  market?: string;
  industry?: string;
  weight?: string;
}

export enum Month {
  January = 1,
  February = 2,
  March = 3,
  April = 4,
  May = 5,
  June = 6,
  July = 7,
  August = 8,
  September = 9,
  October = 10,
  November = 11,
  December = 12
}