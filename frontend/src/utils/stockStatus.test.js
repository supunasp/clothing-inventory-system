import { getStockStatus, STOCK_STATUS, LOW_STOCK_THRESHOLD } from './stockStatus';

describe('getStockStatus', () => {
  it('returns OUT_OF_STOCK for zero, negative, or non-numeric input', () => {
    expect(getStockStatus(0)).toBe(STOCK_STATUS.OUT_OF_STOCK);
    expect(getStockStatus(-5)).toBe(STOCK_STATUS.OUT_OF_STOCK);
    expect(getStockStatus(undefined)).toBe(STOCK_STATUS.OUT_OF_STOCK);
    expect(getStockStatus('abc')).toBe(STOCK_STATUS.OUT_OF_STOCK);
  });

  it('returns LOW_STOCK at and below the threshold (but above zero)', () => {
    expect(getStockStatus(1)).toBe(STOCK_STATUS.LOW_STOCK);
    expect(getStockStatus(LOW_STOCK_THRESHOLD)).toBe(STOCK_STATUS.LOW_STOCK);
  });

  it('returns IN_STOCK above the threshold', () => {
    expect(getStockStatus(LOW_STOCK_THRESHOLD + 1)).toBe(STOCK_STATUS.IN_STOCK);
    expect(getStockStatus(999)).toBe(STOCK_STATUS.IN_STOCK);
  });

  it('coerces numeric strings to numbers', () => {
    expect(getStockStatus('10')).toBe(STOCK_STATUS.IN_STOCK);
    expect(getStockStatus('1')).toBe(STOCK_STATUS.LOW_STOCK);
  });
});
