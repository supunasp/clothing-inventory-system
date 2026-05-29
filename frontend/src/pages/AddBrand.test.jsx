import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AddBrand from './AddBrand';
import axiosInstance from '../axiosConfig';

jest.mock('../axiosConfig', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}));

jest.mock('../components/common/EntityManagementList', () => ({
  __esModule: true,
  default: () => <div data-testid="entity-list" />,
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
      <AddBrand />
    </MemoryRouter>,
  );

describe('AddBrand', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('posts the brand on confirm and shows a success message', async () => {
    axiosInstance.post.mockResolvedValueOnce({ data: {} });
    renderPage();

    fireEvent.change(screen.getByPlaceholderText('Enter Id'), { target: { value: 'B1', name: 'brandId' } });
    fireEvent.change(screen.getByPlaceholderText('Enter Name'), { target: { value: 'Levis', name: 'brandName' } });
    fireEvent.click(screen.getByRole('button', { name: /^submit$/i }));

    expect(await screen.findByText(/are you sure you want to create brand "levis"/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /create brand/i }));

    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith('/api/brands', {
        brandId: 'B1',
        brandName: 'Levis',
      });
    });
    expect(await screen.findByText(/brand saved successfully/i)).toBeInTheDocument();
  });

  it('shows the server error when the API rejects', async () => {
    axiosInstance.post.mockRejectedValueOnce({
      response: { data: { message: 'Duplicate brand' } },
    });
    renderPage();

    fireEvent.change(screen.getByPlaceholderText('Enter Id'), { target: { value: 'B1', name: 'brandId' } });
    fireEvent.change(screen.getByPlaceholderText('Enter Name'), { target: { value: 'Levis', name: 'brandName' } });
    fireEvent.click(screen.getByRole('button', { name: /^submit$/i }));
    fireEvent.click(screen.getByRole('button', { name: /create brand/i }));

    expect(await screen.findByText('Duplicate brand')).toBeInTheDocument();
  });
});
