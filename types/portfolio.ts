export type PortfolioHolding = {
  id: string;
  ticker: string;
  name: string;
  quantity: number;
  averagePurchasePrice: number;
  currentPrice: number;
  notes?: string;
};

export type HoldingInput = Omit<PortfolioHolding, 'id'>;

export type PortfolioSummary = {
  marketValue: number;
  costBasis: number;
  profitLoss: number;
};
