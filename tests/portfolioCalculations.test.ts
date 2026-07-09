import {
  getHoldingCostBasis,
  getHoldingMarketValue,
  getHoldingProfitLoss,
  getPortfolioSummary,
} from '../app/portfolioCalculations';
import type { PortfolioHolding } from '../types/portfolio';

interface TestCase {
  name: string;
  run: () => void;
}

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message}\nExpected: ${String(expected)}\nReceived: ${String(actual)}`);
  }
}

const omuHolding: PortfolioHolding = {
  id: 'omu',
  ticker: 'JSE:OMU',
  name: 'Old Mutual Limited',
  quantity: 25,
  averagePurchasePrice: 12.8,
  currentPrice: 13.45,
};

const abgHolding: PortfolioHolding = {
  id: 'abg',
  ticker: 'JSE:ABG',
  name: 'Absa Group Limited',
  quantity: 8,
  averagePurchasePrice: 175,
  currentPrice: 182.5,
};

const tests: TestCase[] = [
  {
    name: 'calculates market value from manual quantity and current price',
    run: () => {
      assertEqual(getHoldingMarketValue(omuHolding), 336.25, 'Expected market value.');
    },
  },
  {
    name: 'calculates cost basis from manual quantity and average purchase price',
    run: () => {
      assertEqual(getHoldingCostBasis(omuHolding), 320, 'Expected cost basis.');
    },
  },
  {
    name: 'calculates per-holding profit and loss',
    run: () => {
      assertEqual(getHoldingProfitLoss(omuHolding), 16.25, 'Expected profit/loss.');
    },
  },
  {
    name: 'summarizes market value, cost basis, and profit/loss',
    run: () => {
      const summary = getPortfolioSummary([omuHolding, abgHolding]);

      assertEqual(summary.marketValue, 1796.25, 'Expected total market value.');
      assertEqual(summary.costBasis, 1720, 'Expected total cost basis.');
      assertEqual(summary.profitLoss, 76.25, 'Expected total profit/loss.');
    },
  },
];

let failedTests = 0;

for (const test of tests) {
  try {
    test.run();
    console.log(`PASS ${test.name}`);
  } catch (error) {
    failedTests += 1;
    const message = error instanceof Error ? error.message : String(error);
    console.error(`FAIL ${test.name}\n${message}`);
  }
}

if (failedTests > 0) {
  throw new Error(`${failedTests} validation test${failedTests === 1 ? '' : 's'} failed.`);
}

console.log(`\n${tests.length} portfolio calculation tests passed.`);
