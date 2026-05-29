import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import SessionTimeoutModal from './SessionTimeoutModal';
import useSessionTimeout from '../../hooks/useSessionTimeout';

jest.mock('../../hooks/useSessionTimeout');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderModal = () =>
  render(
    <MemoryRouter>
      <AuthProvider>
        <SessionTimeoutModal />
      </AuthProvider>
    </MemoryRouter>,
  );

describe('SessionTimeoutModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    useSessionTimeout.mockReturnValue({
      isWarning: false,
      secondsLeft: 60,
      extendSession: jest.fn(),
    });
  });

  it('renders nothing while the session is not in warning state', () => {
    const { container } = renderModal();
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the countdown when in warning state', () => {
    useSessionTimeout.mockReturnValue({
      isWarning: true,
      secondsLeft: 30,
      extendSession: jest.fn(),
    });
    renderModal();

    expect(screen.getByText(/session about to expire/i)).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText(/seconds/i)).toBeInTheDocument();
  });

  it('uses singular "second" when one second remains', () => {
    useSessionTimeout.mockReturnValue({
      isWarning: true,
      secondsLeft: 1,
      extendSession: jest.fn(),
    });
    renderModal();

    expect(screen.getByText(/second\./i)).toBeInTheDocument();
  });

  it('extends the session when Continue session is clicked', () => {
    const extendSession = jest.fn();
    useSessionTimeout.mockReturnValue({ isWarning: true, secondsLeft: 30, extendSession });
    renderModal();

    fireEvent.click(screen.getByRole('button', { name: /continue session/i }));
    expect(extendSession).toHaveBeenCalledTimes(1);
  });

  it('logs out and navigates to /login when Log out is clicked', () => {
    window.localStorage.setItem('user', JSON.stringify({ token: 'tok' }));
    useSessionTimeout.mockReturnValue({
      isWarning: true,
      secondsLeft: 5,
      extendSession: jest.fn(),
    });
    renderModal();

    fireEvent.click(screen.getByRole('button', { name: /log out/i }));

    expect(window.localStorage.getItem('user')).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
  });
});
