import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminProductDetails from './AdminProductDetails';
import axiosInstance from '../axiosConfig';

jest.mock('../axiosConfig', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

jest.mock('../components/common/PageHeader', () => ({
  __esModule: true,
  default: ({ title }) => <div>{title}</div>,
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ productId: 'P1' }),
  useLocation: () => ({ state: mockLocationState }),
}));

let mockLocationState = null;
const setLocationState = (state) => {
  mockLocationState = state;
};

const stubAxiosGetByUrl = () => {
  axiosInstance.get.mockImplementation((url) => {
    if (url.startsWith('/api/products/variants')) {
      return Promise.resolve({ data: [{ variantId: 'V1', color: 'Blue', size: 'M', stockAmount: 12 }] });
    }
    if (url.startsWith('/api/inventory-audits')) {
      return Promise.resolve({ data: { data: [], pagination: null } });
    }
    if (url.startsWith('/api/products/')) {
      return Promise.resolve({ data: { productId: 'P1', name: 'Fetched Shirt' } });
    }
    return Promise.resolve({ data: {} });
  });
};

describe('AdminProductDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setLocationState(null);
  });

  it('uses product from location.state and skips the product fetch', async () => {
    setLocationState({ product: { productId: 'P1', name: 'State Shirt' } });
    stubAxiosGetByUrl();

    render(
      <MemoryRouter>
        <AdminProductDetails />
      </MemoryRouter>,
    );

    expect(await screen.findByText('State Shirt')).toBeInTheDocument();
    expect(axiosInstance.get).not.toHaveBeenCalledWith(
      '/api/products/P1',
      expect.anything(),
    );
  });

  it('fetches the product when location.state is empty', async () => {
    setLocationState(null);
    stubAxiosGetByUrl();

    render(
      <MemoryRouter>
        <AdminProductDetails />
      </MemoryRouter>,
    );

    expect(await screen.findByText('Fetched Shirt')).toBeInTheDocument();
  });

  it('surfaces a fetch error from the API', async () => {
    setLocationState(null);
    axiosInstance.get.mockRejectedValue({
      response: { data: { message: 'Product not found' } },
    });

    render(
      <MemoryRouter>
        <AdminProductDetails />
      </MemoryRouter>,
    );

    expect(await screen.findByText('Product not found')).toBeInTheDocument();
  });
});
