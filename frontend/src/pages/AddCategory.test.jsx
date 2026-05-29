import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AddCategory from './AddCategory';
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
      <AddCategory />
    </MemoryRouter>,
  );

const fillForm = ({ id = 'CAT1', name = 'Tops' } = {}) => {
  fireEvent.change(screen.getByPlaceholderText('Enter Id'), { target: { value: id, name: 'categoryId' } });
  fireEvent.change(screen.getByPlaceholderText('Enter Name'), { target: { value: name, name: 'categoryName' } });
};

describe('AddCategory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('opens the confirmation modal on submit and posts on confirm', async () => {
    axiosInstance.post.mockResolvedValueOnce({ data: {} });
    renderPage();

    fillForm({ id: 'CAT1', name: 'Tops' });
    fireEvent.click(screen.getByRole('button', { name: /^submit$/i }));

    expect(await screen.findByText(/are you sure you want to create category "tops"/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /create category/i }));

    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith('/api/categories', {
        categoryId: 'CAT1',
        categoryName: 'Tops',
      });
    });
    expect(await screen.findByText(/category saved successfully/i)).toBeInTheDocument();
  });

  it('shows the server error message when the API rejects', async () => {
    axiosInstance.post.mockRejectedValueOnce({
      response: { data: { message: 'Duplicate category' } },
    });
    renderPage();

    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /^submit$/i }));
    fireEvent.click(screen.getByRole('button', { name: /create category/i }));

    expect(await screen.findByText('Duplicate category')).toBeInTheDocument();
  });

  it('navigates back to the dashboard when Cancel is clicked', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});
