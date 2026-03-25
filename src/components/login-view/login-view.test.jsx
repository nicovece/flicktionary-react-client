import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LoginView } from './login-view';

beforeEach(() => {
  global.fetch = jest.fn();
  jest.spyOn(Storage.prototype, 'setItem');
});

afterEach(() => {
  jest.restoreAllMocks();
});

const renderLogin = (props = {}) =>
  render(
    <MemoryRouter>
      <LoginView onLoggedIn={jest.fn()} {...props} />
    </MemoryRouter>
  );

describe('LoginView', () => {
  it('calls fetch with correct credentials on submit', async () => {
    const user = userEvent.setup();
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ user: { Username: 'testuser' }, token: 'abc123' }),
    });

    renderLogin();

    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/password/i), 'mypassword');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/login'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ Username: 'testuser', Password: 'mypassword' }),
      })
    );
  });

  it('calls onLoggedIn callback on successful login', async () => {
    const user = userEvent.setup();
    const mockOnLoggedIn = jest.fn();
    const mockUser = { Username: 'testuser' };
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ user: mockUser, token: 'abc123' }),
    });

    renderLogin({ onLoggedIn: mockOnLoggedIn });

    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/password/i), 'mypassword');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(mockOnLoggedIn).toHaveBeenCalledWith(mockUser, 'abc123');
    });
  });

  it('shows error alert on failed login', async () => {
    const user = userEvent.setup();
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({}),
    });

    renderLogin();

    await user.type(screen.getByLabelText(/username/i), 'wrong');
    await user.type(screen.getByLabelText(/password/i), 'wrong');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/invalid username or password/i);
    });
  });

  it('shows loading spinner during request', async () => {
    const user = userEvent.setup();
    let resolveFetch;
    global.fetch.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveFetch = resolve;
      })
    );

    renderLogin();

    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/password/i), 'mypassword');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(screen.getByText(/logging in/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled();

    resolveFetch({
      json: () => Promise.resolve({ user: { Username: 'testuser' }, token: 'abc123' }),
    });

    await waitFor(() => {
      expect(screen.queryByText(/logging in/i)).not.toBeInTheDocument();
    });
  });
});
