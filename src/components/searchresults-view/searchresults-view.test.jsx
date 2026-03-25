import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { SearchResultsView } from './searchresults-view';

const mockApiMovies = [
  {
    _id: '1',
    Title: 'Inception',
    Description: 'Dreams within dreams',
    Director: { Name: 'Christopher Nolan' },
    Genre: { Name: 'Sci-Fi' },
    ImagePath: 'https://example.com/inception.jpg',
    Featured: true,
    Actors: ['Leonardo DiCaprio'],
  },
  {
    _id: '2',
    Title: 'The Matrix',
    Description: 'Reality is a simulation',
    Director: { Name: 'Wachowskis' },
    Genre: { Name: 'Sci-Fi' },
    ImagePath: 'https://example.com/matrix.jpg',
    Featured: false,
    Actors: ['Keanu Reeves'],
  },
];

const defaultProps = {
  user: { Username: 'testuser' },
  token: 'fake-token',
  onToggleFavorite: jest.fn(),
  isMovieFavorite: jest.fn(() => false),
};

beforeEach(() => {
  jest.useFakeTimers();
  global.fetch = jest.fn();
  // First call: options fetch (/movies), second call: search (/search)
  global.fetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockApiMovies),
  });
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

const renderSearch = () =>
  render(
    <MemoryRouter>
      <SearchResultsView {...defaultProps} />
    </MemoryRouter>
  );

describe('SearchResultsView', () => {
  it('renders search results from API', async () => {
    renderSearch();

    await waitFor(() => {
      expect(screen.getByText('Inception')).toBeInTheDocument();
      expect(screen.getByText('The Matrix')).toBeInTheDocument();
    });
  });

  it('debounces search input', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderSearch();

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Inception')).toBeInTheDocument();
    });

    // Clear call count after initial fetches
    global.fetch.mockClear();
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockApiMovies),
    });

    const searchInput = screen.getByPlaceholderText(/search movies/i);

    // Type multiple characters quickly
    await user.type(searchInput, 'abc');

    // Should not have called fetch yet (debounce pending)
    expect(global.fetch).not.toHaveBeenCalled();

    // Advance past debounce timer
    jest.advanceTimersByTime(500);

    await waitFor(() => {
      // Only one search call after debounce
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/search?q=abc'),
        expect.any(Object)
      );
    });
  });

  it('shows error alert when search fails', async () => {
    // Options fetch succeeds, search fetch fails
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiMovies),
      })
      .mockResolvedValueOnce({
        ok: false,
      });

    renderSearch();

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/search failed/i);
    });
    expect(screen.getByText(/no movies found/i)).toBeInTheDocument();
  });

  it('shows loading spinner while searching', async () => {
    let resolveSearch;
    // Options fetch resolves immediately
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiMovies),
    });
    // Search fetch hangs
    global.fetch.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveSearch = resolve;
      })
    );

    renderSearch();

    await waitFor(() => {
      expect(screen.getByText(/searching for movies/i)).toBeInTheDocument();
    });

    resolveSearch({
      ok: true,
      json: () => Promise.resolve(mockApiMovies),
    });

    await waitFor(() => {
      expect(screen.queryByText(/searching for movies/i)).not.toBeInTheDocument();
      expect(screen.getByText('Inception')).toBeInTheDocument();
    });
  });
});
