import { render, screen } from '@testing-library/react';
import StockBadge from './StockBadge';

describe('StockBadge', () => {
  it('shows "Out of Stock" when stock is zero', () => {
    render(<StockBadge stockAmount={0} />);
    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
  });

  it('shows "Out of Stock" when stock is negative or NaN', () => {
    const { rerender } = render(<StockBadge stockAmount={-3} />);
    expect(screen.getByText('Out of Stock')).toBeInTheDocument();

    rerender(<StockBadge stockAmount="not-a-number" />);
    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
  });

  it('shows "Low Stock" when stock is within the low threshold', () => {
    render(<StockBadge stockAmount={3} />);
    expect(screen.getByText('Low Stock')).toBeInTheDocument();
  });

  it('shows "In Stock" when stock is comfortably above the threshold', () => {
    render(<StockBadge stockAmount={50} />);
    expect(screen.getByText('In Stock')).toBeInTheDocument();
  });
});
