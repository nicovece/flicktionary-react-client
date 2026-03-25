import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { SignupView } from './signup-view';

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

const renderSignup = () =>
  render(
    <MemoryRouter>
      <SignupView />
    </MemoryRouter>
  );

const fillForm = async (user, overrides = {}) => {
  const values = {
    username: 'validuser',
    password: 'ValidPass1!',
    email: 'test@example.com',
    birthday: '2000-01-15',
    ...overrides,
  };
  await user.type(screen.getByLabelText(/username/i), values.username);
  await user.type(screen.getByLabelText(/password/i), values.password);
  await user.type(screen.getByLabelText(/email/i), values.email);
  await user.type(screen.getByLabelText(/birthday/i), values.birthday);
};

describe('SignupView', () => {
  it('shows validation error for short username', async () => {
    const user = userEvent.setup();
    renderSignup();

    await fillForm(user, { username: 'ab' });
    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      /username must be at least 5 characters/i
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('shows validation error for short password', async () => {
    const user = userEvent.setup();
    renderSignup();

    await fillForm(user, { password: 'short' });
    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      /password must be at least 8 characters/i
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup();
    renderSignup();

    await fillForm(user, { email: 'notanemail' });
    // Use fireEvent.submit to bypass browser-level type="email" validation
    fireEvent.submit(screen.getByRole('button', { name: /submit/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      /please enter a valid email/i
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('shows validation error for future birthday', async () => {
    const user = userEvent.setup();
    renderSignup();

    await fillForm(user, { birthday: '2099-01-01' });
    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      /cannot be in the future/i
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('shows validation error for age under 13', async () => {
    const user = userEvent.setup();
    renderSignup();

    const today = new Date();
    const tooYoung = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate());
    const birthday = tooYoung.toISOString().split('T')[0];

    await fillForm(user, { birthday });
    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      /must be at least 13 years old/i
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('shows success message and clears form on valid submission', async () => {
    const user = userEvent.setup();
    global.fetch.mockResolvedValueOnce({ ok: true });
    renderSignup();

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/signup successful/i);
    });
    expect(screen.getByLabelText(/username/i)).toHaveValue('');
    expect(screen.getByLabelText(/password/i)).toHaveValue('');
    expect(screen.getByLabelText(/email/i)).toHaveValue('');
  });
});
