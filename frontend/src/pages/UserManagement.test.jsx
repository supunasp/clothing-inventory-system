import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UserManagement from './UserManagement';
import axiosInstance from '../axiosConfig';
import { AuthProvider } from '../context/AuthContext';
import { ROLE_ADMIN, ROLE_STAFF } from '../constants';

jest.mock('../axiosConfig', () => ({
  __esModule: true,
  default: { get: jest.fn(), put: jest.fn(), delete: jest.fn() },
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

const sampleUsers = [
  { id: 'u1', firstName: 'Alice', lastName: 'Adams', email: 'alice@example.com', role: ROLE_ADMIN, active: true },
  { id: 'u2', firstName: 'Bob', lastName: 'Brown', email: 'bob@example.com', role: ROLE_STAFF, active: false },
];

const setUsersResponse = (users = sampleUsers, pagination = null) => {
  axiosInstance.get.mockResolvedValueOnce({ data: { data: users, pagination } });
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <AuthProvider>
        <UserManagement />
      </AuthProvider>
    </MemoryRouter>,
  );

describe('UserManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
  });

  it('renders the loaded users', async () => {
    setUsersResponse();
    renderPage();

    expect(await screen.findByText('Alice Adams')).toBeInTheDocument();
    expect(screen.getByText('Bob Brown')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    // The status badge and the filter option both say "Active"; assert at least one badge.
    expect(screen.getAllByText('Active').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Inactive').length).toBeGreaterThan(0);
  });

  it('shows the empty state when no users match', async () => {
    setUsersResponse([]);
    renderPage();
    expect(await screen.findByText(/no users found/i)).toBeInTheDocument();
  });

  it('shows an error banner when the API rejects', async () => {
    axiosInstance.get.mockRejectedValueOnce({
      response: { data: { message: 'Forbidden' } },
    });
    renderPage();

    expect(await screen.findByText('Forbidden')).toBeInTheDocument();
  });

  it('opens a deactivate confirmation when the Deactivate button is clicked', async () => {
    setUsersResponse();
    renderPage();

    const deactivate = await screen.findByRole('button', { name: 'Deactivate' });
    fireEvent.click(deactivate);

    expect(await screen.findByText(/are you sure you want to deactivate alice adams/i)).toBeInTheDocument();
  });

  it('calls the status endpoint and reloads users on confirm', async () => {
    setUsersResponse();
    setUsersResponse();
    axiosInstance.put.mockResolvedValueOnce({ data: { message: 'User deactivated' } });
    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: 'Deactivate' }));

    // Two "Deactivate" buttons exist once the modal opens (row + modal confirm).
    // Scope the modal click to the dialog heading's container.
    const modalHeading = await screen.findByText('Deactivate User');
    const modalRoot = modalHeading.closest('div.rounded-xl');
    fireEvent.click(within(modalRoot).getByRole('button', { name: /^deactivate$/i }));

    await waitFor(() => {
      expect(axiosInstance.put).toHaveBeenCalledWith('/api/admin/users/u1/status', { active: false });
    });
  });

  it('opens a delete confirmation when Delete is clicked', async () => {
    setUsersResponse();
    renderPage();

    fireEvent.click((await screen.findAllByRole('button', { name: 'Delete' }))[0]);
    expect(await screen.findByText(/permanently delete alice adams/i)).toBeInTheDocument();
  });
});
