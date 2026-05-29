import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Login from './Login';
import axiosInstance from '../axiosConfig';

jest.mock('../axiosConfig', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderLogin = () =>
  render(
    <MemoryRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </MemoryRouter>,
  );

const fillAndSubmit = (email = 'alice@example.com', password = 'pw') => {
  fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: email } });
  fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: password } });
  fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
};

describe('Login page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
  });

  it('renders the form with email, password, and submit', () => {
    renderLogin();

    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('posts to /api/auth/login and navigates to /dashboard on success', async () => {
    const userPayload = { id: '1', name: 'Alice', token: 'tok' };
    axiosInstance.post.mockResolvedValueOnce({ data: userPayload });

    renderLogin();
    fillAndSubmit('alice@example.com', 'secret');

    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith('/api/auth/login', {
        email: 'alice@example.com',
        password: 'secret',
      });
    });
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard'));
    expect(JSON.parse(window.localStorage.getItem('user'))).toEqual(userPayload);
  });

  it('shows the server-provided error message on failure', async () => {
    axiosInstance.post.mockRejectedValueOnce({
      response: { data: { message: 'Invalid credentials' } },
    });

    renderLogin();
    fillAndSubmit();

    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows a generic fallback when the server returns no message', async () => {
    axiosInstance.post.mockRejectedValueOnce(new Error('network'));

    renderLogin();
    fillAndSubmit();

    expect(await screen.findByText(/login failed/i)).toBeInTheDocument();
  });

  it('toggles password visibility', () => {
    renderLogin();
    const pwInput = screen.getByPlaceholderText('Password');
    expect(pwInput).toHaveAttribute('type', 'password');

    fireEvent.click(screen.getByRole('button', { name: /show password/i }));
    expect(pwInput).toHaveAttribute('type', 'text');

    fireEvent.click(screen.getByRole('button', { name: /hide password/i }));
    expect(pwInput).toHaveAttribute('type', 'password');
  });
});
