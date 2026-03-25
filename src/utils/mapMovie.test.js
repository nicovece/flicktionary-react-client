import { mapMovieFromApi } from './mapMovie';

describe('mapMovieFromApi', () => {
  it('maps all fields correctly from API format', () => {
    const apiMovie = {
      _id: '123',
      Title: 'Inception',
      Description: 'A mind-bending thriller',
      Director: { Name: 'Christopher Nolan' },
      Genre: { Name: 'Sci-Fi' },
      ImagePath: 'https://example.com/inception.jpg',
      Featured: true,
      Actors: ['Leonardo DiCaprio', 'Tom Hardy'],
    };

    const result = mapMovieFromApi(apiMovie);

    expect(result).toEqual({
      id: '123',
      title: 'Inception',
      description: 'A mind-bending thriller',
      director: 'Christopher Nolan',
      genre: 'Sci-Fi',
      image: 'https://example.com/inception.jpg',
      featured: true,
      actors: ['Leonardo DiCaprio', 'Tom Hardy'],
    });
  });

  it('handles missing optional fields gracefully', () => {
    const apiMovie = {
      _id: '456',
      Title: 'Unknown',
      Description: '',
      Director: { Name: '' },
      Genre: { Name: '' },
      ImagePath: '',
      Featured: false,
      Actors: [],
    };

    const result = mapMovieFromApi(apiMovie);

    expect(result.id).toBe('456');
    expect(result.title).toBe('Unknown');
    expect(result.actors).toEqual([]);
  });
});
