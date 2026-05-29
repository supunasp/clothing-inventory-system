import axiosInstance from './axiosConfig';

const runRequestInterceptor = (config = { headers: {} }) => {
  const handlers = axiosInstance.interceptors.request.handlers.filter(Boolean);
  return handlers.reduce((acc, h) => h.fulfilled(acc), config);
};

describe('axiosConfig request interceptor', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('attaches a Bearer Authorization header when a user with a token is stored', () => {
    window.localStorage.setItem('user', JSON.stringify({ token: 'tok-123' }));

    const result = runRequestInterceptor();

    expect(result.headers.Authorization).toBe('Bearer tok-123');
  });

  it('does not attach Authorization when no user is stored', () => {
    const result = runRequestInterceptor();

    expect(result.headers.Authorization).toBeUndefined();
  });

  it('does not attach Authorization when the stored user has no token', () => {
    window.localStorage.setItem('user', JSON.stringify({ name: 'Alice' }));

    const result = runRequestInterceptor();

    expect(result.headers.Authorization).toBeUndefined();
  });
});
