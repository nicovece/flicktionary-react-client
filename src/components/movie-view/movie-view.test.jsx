import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { MovieView } from './movie-view';

const mockMovies = [
  {
    id: '1',
    title: 'Inception',
    description: 'Dreams within dreams',
    director: 'Christopher Nolan',
    genre: 'Sci-Fi',
    image: 'https://example.com/inception.jpg',
    featured: true,
    actors: ['Leonardo DiCaprio', 'Tom Hardy'],
  },
  {
    id: '2',
    title: 'The Matrix',
    description: 'Reality is a simulation',
    director: 'Wachowskis',
    genre: 'Sci-Fi',
    image: 'https://example.com/matrix.jpg',
    featured: false,
    actors: ['Keanu Reeves'],
  },
  {
    id: '3',
    title: 'The Godfather',
    description: 'A crime family saga',
    director: 'Francis Ford Coppola',
    genre: 'Drama',
    image: 'https://example.com/godfather.jpg',
    featured: true,
    actors: ['Marlon Brando'],
  },
];

const defaultProps = {
  movies: mockMovies,
  isMovieFavorite: jest.fn(() => false),
  onToggleFavorite: jest.fn(),
};

const renderMovieView = (movieId, props = {}) =>
  render(
    <MemoryRouter initialEntries={[`/movies/${movieId}`]}>
      <Routes>
        <Route
          path="/movies/:movieId"
          element={<MovieView {...defaultProps} {...props} />}
        />
      </Routes>
    </MemoryRouter>
  );

describe('MovieView', () => {
  it('shows loading state when movies array is empty', () => {
    renderMovieView('1', { movies: [] });
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows "Movie not found" for an unknown movieId', () => {
    renderMovieView('unknown-id');
    expect(screen.getByText('Movie not found')).toBeInTheDocument();
  });

  it('renders movie details for a valid movieId', () => {
    renderMovieView('1');

    expect(screen.getByRole('heading', { name: 'Inception' })).toBeInTheDocument();
    expect(screen.getByText(/christopher nolan/i)).toBeInTheDocument();
    expect(screen.getByText(/dreams within dreams/i)).toBeInTheDocument();
    expect(screen.getByText(/leonardo dicaprio, tom hardy/i)).toBeInTheDocument();
  });

  it('renders similar movies of the same genre', () => {
    renderMovieView('1');

    expect(
      screen.getByText(/other movies in the genre sci-fi/i)
    ).toBeInTheDocument();
    expect(screen.getByText('The Matrix')).toBeInTheDocument();
    expect(screen.queryByText('The Godfather')).not.toBeInTheDocument();
  });

  it('does not render similar movies section when none exist', () => {
    renderMovieView('3'); // The Godfather — only Drama movie

    expect(
      screen.queryByText(/other movies in the genre/i)
    ).not.toBeInTheDocument();
  });
});
