import { act, render, renderHook, screen } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

describe('AuthContext', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('starts with no user when localStorage is empty', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user).toBeNull();
  });

  it('hydrates user from localStorage on mount', () => {
    const stored = { id: '1', name: 'Alice', token: 'abc' };
    window.localStorage.setItem('user', JSON.stringify(stored));

    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user).toEqual(stored);
  });

  it('login() persists the user to localStorage and updates state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    const payload = { id: '2', name: 'Bob', token: 'xyz' };

    act(() => result.current.login(payload));

    expect(result.current.user).toEqual(payload);
    expect(JSON.parse(window.localStorage.getItem('user'))).toEqual(payload);
  });

  it('logout() removes the user from localStorage and state', () => {
    window.localStorage.setItem('user', JSON.stringify({ token: 'abc' }));
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => result.current.logout());

    expect(result.current.user).toBeNull();
    expect(window.localStorage.getItem('user')).toBeNull();
  });

  it('exposes context value to consumers via useAuth', () => {
    const Consumer = () => {
      const { user } = useAuth();
      return <div>{user ? user.name : 'guest'}</div>;
    };

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    expect(screen.getByText('guest')).toBeInTheDocument();
  });
});
