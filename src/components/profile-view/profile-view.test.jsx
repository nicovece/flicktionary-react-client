import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ProfileView } from './profile-view';

const mockUser = { Username: 'testuser' };

const mockApiUser = {
  Username: 'testuser',
  Email: 'test@example.com',
  Birthday: '2000-06-15T00:00:00.000Z',
  FavoriteMovies: ['1'],
};

const mockMovies = [
  {
    id: '1',
    title: 'Inception',
    image: 'https://example.com/inception.jpg',
  },
];

const defaultProps = {
  user: mockUser,
  movies: mockMovies,
  favoriteMovies: ['1'],
  onToggleFavorite: jest.fn(),
  onLoggedOut: jest.fn(),
};

beforeEach(() => {
  global.fetch = jest.fn();
  localStorage.setItem('token', 'fake-token');
  // Default: user fetch succeeds
  global.fetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockApiUser),
  });
});

afterEach(() => {
  localStorage.clear();
  jest.restoreAllMocks();
});

const renderProfile = (props = {}) =>
  render(
    <MemoryRouter>
      <ProfileView {...defaultProps} {...props} />
    </MemoryRouter>
  );

describe('ProfileView', () => {
  it('fetches and displays user profile information', async () => {
    renderProfile();

    await waitFor(() => {
      expect(screen.getByText(/welcome testuser/i)).toBeInTheDocument();
    });
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('shows loading state before user data arrives', () => {
    global.fetch.mockReturnValueOnce(new Promise(() => {}));
    renderProfile();

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders favorite movies list', async () => {
    renderProfile();

    await waitFor(() => {
      expect(screen.getByText('Inception')).toBeInTheDocument();
    });
  });

  it('shows empty favorites message when none exist', async () => {
    renderProfile({ favoriteMovies: [] });

    await waitFor(() => {
      expect(screen.getByText(/no favorite movies yet/i)).toBeInTheDocument();
    });
  });

  it('opens edit profile modal and populates form fields', async () => {
    const user = userEvent.setup();
    renderProfile();

    await waitFor(() => {
      expect(screen.getByText(/welcome testuser/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /edit profile/i }));

    // Modal title is an h4 inside the modal header
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2000-06-15')).toBeInTheDocument();
  });

  it('submits profile update and shows success message', async () => {
    const user = userEvent.setup();
    const updatedUser = { ...mockApiUser, Email: 'new@example.com' };
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiUser),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(updatedUser),
      });

    renderProfile();

    await waitFor(() => {
      expect(screen.getByText(/welcome testuser/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /edit profile/i }));

    await waitFor(() => {
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    });

    const emailInput = screen.getByDisplayValue('test@example.com');
    await user.clear(emailInput);
    await user.type(emailInput, 'new@example.com');
    await user.click(screen.getByRole('button', { name: /update profile/i }));

    await waitFor(() => {
      expect(screen.getByText(/profile updated successfully/i)).toBeInTheDocument();
    });

    // Verify PUT was called with correct endpoint
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/users/testuser'),
      expect.objectContaining({ method: 'PUT' })
    );
  });

  it('does not call DELETE when user cancels deregister', async () => {
    const user = userEvent.setup();
    jest.spyOn(window, 'confirm').mockReturnValue(false);

    renderProfile();

    await waitFor(() => {
      expect(screen.getByText(/welcome testuser/i)).toBeInTheDocument();
    });

    global.fetch.mockClear();
    await user.click(screen.getByRole('button', { name: /deregister/i }));

    expect(window.confirm).toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('calls DELETE and logs out when user confirms deregister', async () => {
    const user = userEvent.setup();
    const mockOnLoggedOut = jest.fn();
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiUser),
      })
      .mockResolvedValueOnce({ ok: true });

    renderProfile({ onLoggedOut: mockOnLoggedOut });

    await waitFor(() => {
      expect(screen.getByText(/welcome testuser/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /deregister/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/testuser'),
        expect.objectContaining({ method: 'DELETE' })
      );
      expect(mockOnLoggedOut).toHaveBeenCalled();
    });
  });
});
