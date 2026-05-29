import { fireEvent, render, screen } from '@testing-library/react';
import Pagination from './Pagination';

const mkPagination = (overrides = {}) => ({
  page: 2,
  totalPages: 5,
  hasPreviousPage: true,
  hasNextPage: true,
  ...overrides,
});

describe('Pagination', () => {
  it('renders nothing when pagination is undefined', () => {
    const { container } = render(<Pagination onPageChange={jest.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('displays current and total pages', () => {
    render(<Pagination pagination={mkPagination()} onPageChange={jest.fn()} />);
    expect(screen.getByText('Page 2 of 5')).toBeInTheDocument();
  });

  it('disables Previous on the first page', () => {
    render(
      <Pagination
        pagination={mkPagination({ page: 1, hasPreviousPage: false })}
        onPageChange={jest.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled();
  });

  it('disables Next on the last page', () => {
    render(
      <Pagination
        pagination={mkPagination({ page: 5, hasNextPage: false })}
        onPageChange={jest.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });

  it('calls onPageChange with neighbour page numbers', () => {
    const onPageChange = jest.fn();
    render(<Pagination pagination={mkPagination()} onPageChange={onPageChange} />);

    fireEvent.click(screen.getByRole('button', { name: /previous/i }));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    expect(onPageChange).toHaveBeenNthCalledWith(1, 1);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 3);
  });
});
