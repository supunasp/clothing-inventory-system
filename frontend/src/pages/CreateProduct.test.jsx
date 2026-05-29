import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CreateProduct from './CreateProduct';
import axiosInstance from '../axiosConfig';

jest.mock('../axiosConfig', () => ({
  __esModule: true,
  default: { post: jest.fn() },
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
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <CreateProduct />
    </MemoryRouter>,
  );

const fillForm = () => {
  fireEvent.change(screen.getByRole('combobox', { name: /category/i }), { target: { value: 'C1' } });
  fireEvent.change(screen.getByRole('combobox', { name: /brand/i }), { target: { value: 'B1' } });
  fireEvent.change(screen.getByPlaceholderText('Enter Id'), { target: { value: 'P1', name: 'productId' } });
  fireEvent.change(screen.getByPlaceholderText('Enter Name'), { target: { value: 'Shirt', name: 'name' } });
};

describe('CreateProduct', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders category and brand options from useReferenceData', () => {
    renderPage();
    expect(screen.getByRole('option', { name: 'Tops' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Levis' })).toBeInTheDocument();
  });

  it('posts the product on confirm and shows a success row', async () => {
    axiosInstance.post.mockResolvedValueOnce({ data: { product: { productId: 'P1', name: 'Shirt' } } });

    renderPage();
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /^submit$/i }));
    fireEvent.click(screen.getByRole('button', { name: /create product/i }));

    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/api/products',
        expect.objectContaining({ productId: 'P1', name: 'Shirt', category: 'C1', brand: 'B1' }),
      );
    });
    expect(await screen.findByText('New Product Saved!')).toBeInTheDocument();
  });

  it('navigates to /inventory/add with the created product when Update Inventory is clicked', async () => {
    const created = { productId: 'P1', name: 'Shirt' };
    axiosInstance.post.mockResolvedValueOnce({ data: { product: created } });

    renderPage();
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /^submit$/i }));
    fireEvent.click(screen.getByRole('button', { name: /create product/i }));

    const updateBtn = await screen.findByRole('button', { name: /update inventory/i });
    fireEvent.click(updateBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/inventory/add', { state: { product: created } });
  });
});
