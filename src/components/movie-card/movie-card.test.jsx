import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { MovieCard } from './movie-card';

const mockMovie = {
  id: '123',
  title: 'Inception',
  image: 'https://example.com/inception.jpg',
};

const renderCard = (props = {}) =>
  render(
    <MemoryRouter>
      <MovieCard movie={mockMovie} {...props} />
    </MemoryRouter>
  );

describe('MovieCard', () => {
  it('renders movie title and image', () => {
    renderCard();

    expect(screen.getByText('Inception')).toBeInTheDocument();
    expect(screen.getByAltText('Inception movie poster')).toHaveAttribute(
      'src',
      'https://example.com/inception.jpg'
    );
  });

  it('calls onToggleFavorite with movie ID on heart click', async () => {
    const user = userEvent.setup();
    const mockToggle = jest.fn();
    renderCard({ onToggleFavorite: mockToggle, isFavorite: false });

    await user.click(screen.getByRole('button', { name: /add to favorites/i }));

    expect(mockToggle).toHaveBeenCalledWith('123');
  });

  it('shows "Remove from Favorites" when isFavorite is true', () => {
    renderCard({ onToggleFavorite: jest.fn(), isFavorite: true });

    expect(
      screen.getByRole('button', { name: /remove from favorites/i })
    ).toBeInTheDocument();
  });

  it('shows "Add to Favorites" when isFavorite is false', () => {
    renderCard({ onToggleFavorite: jest.fn(), isFavorite: false });

    expect(
      screen.getByRole('button', { name: /add to favorites/i })
    ).toBeInTheDocument();
  });
});
