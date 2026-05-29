import { render, screen } from '@testing-library/react';
import InventoryAuditList from './InventoryAuditList';
import axiosInstance from '../axiosConfig';

jest.mock('../axiosConfig', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

const sampleAudits = [
  {
    auditId: 'a1',
    createdAt: '2026-05-01T12:00:00Z',
    product: { name: 'Shirt', productId: 'P1' },
    color: 'Blue',
    size: 'M',
    type: 'increase',
    quantityBefore: 5,
    quantityAfter: 15,
    amount: 10,
    reference: 'REF-1',
    updatedBy: { firstName: 'Alice', lastName: 'Adams' },
  },
];

describe('InventoryAuditList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the loaded audit rows', async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: { data: sampleAudits, pagination: null } });

    render(<InventoryAuditList />);

    expect(await screen.findByText('Shirt')).toBeInTheDocument();
    expect(screen.getByText('(P1)')).toBeInTheDocument();
    expect(screen.getByText('REF-1')).toBeInTheDocument();
    expect(screen.getByText('Alice Adams')).toBeInTheDocument();
    expect(screen.getByText('increase')).toBeInTheDocument();
  });

  it('shows the empty state when there are no audits', async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: { data: [], pagination: null } });

    render(<InventoryAuditList />);
    expect(await screen.findByText(/no inventory audits yet/i)).toBeInTheDocument();
  });

  it('shows an error banner when the API rejects', async () => {
    axiosInstance.get.mockRejectedValueOnce({
      response: { data: { message: 'Forbidden' } },
    });

    render(<InventoryAuditList />);
    expect(await screen.findByText('Forbidden')).toBeInTheDocument();
  });
});
