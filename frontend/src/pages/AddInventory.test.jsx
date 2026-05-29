import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AddInventory from './AddInventory';
import axiosInstance from '../axiosConfig';

jest.mock('../axiosConfig', () => ({
  __esModule: true,
  default: { post: jest.fn(), get: jest.fn().mockResolvedValue({ data: { data: [] } }) },
}));

jest.mock('../hooks/useReferenceData', () => ({
  __esModule: true,
  default: () => ({
    categories: [{ categoryId: 'C1', categoryName: 'Tops' }],
    brands: [{ brandId: 'B1', brandName: 'Levis' }],
  }),
}));

jest.mock('../components/common/PageHeader', () => ({
  __esModule: true,
  default: ({ title }) => <div>{title}</div>,
}));

const mockNavigate = jest.fn();
const mockLocationState = { product: { productId: 'P1', name: 'Shirt', category: { categoryName: 'Tops' }, brand: { brandName: 'Levis' } } };
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: mockLocationState }),
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <AddInventory />
    </MemoryRouter>,
  );

const fillVariant = () => {
  fireEvent.change(screen.getByRole('combobox', { name: /color/i }), { target: { value: 'Blue' } });
  fireEvent.change(screen.getByRole('combobox', { name: /size/i }), { target: { value: 'M' } });
  fireEvent.change(screen.getByPlaceholderText('Enter Stock Amount'), { target: { value: '10', name: 'stockAmount' } });
  fireEvent.change(screen.getByPlaceholderText('Enter Reference'), { target: { value: 'REF-1', name: 'reference' } });
};

describe('AddInventory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the breadcrumb with category, brand, and product when product is passed via state', () => {
    renderPage();
    expect(screen.getByText('Tops')).toBeInTheDocument();
    expect(screen.getByText('Levis')).toBeInTheDocument();
    expect(screen.getByText('Shirt')).toBeInTheDocument();
  });

  it('posts a new variant on confirm and shows success', async () => {
    axiosInstance.post.mockResolvedValueOnce({ data: {} });
    renderPage();

    fillVariant();
    fireEvent.click(screen.getByRole('button', { name: /^submit$/i }));

    expect(await screen.findByText(/are you sure you want to add 10 items/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /update inventory/i }));

    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith('/api/products/variants', {
        productId: 'P1',
        color: 'Blue',
        size: 'M',
        stockAmount: 10,
        reference: 'REF-1',
      });
    });
    expect(await screen.findByText(/inventory saved successfully/i)).toBeInTheDocument();
  });

  it('surfaces server error messages when the API rejects', async () => {
    axiosInstance.post.mockRejectedValueOnce({
      response: { data: { message: 'Variant already exists' } },
    });
    renderPage();

    fillVariant();
    fireEvent.click(screen.getByRole('button', { name: /^submit$/i }));
    fireEvent.click(screen.getByRole('button', { name: /update inventory/i }));

    expect(await screen.findByText('Variant already exists')).toBeInTheDocument();
  });
});
