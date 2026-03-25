export const mapMovieFromApi = (movie) => ({
  id: movie._id,
  title: movie.Title,
  description: movie.Description,
  director: movie.Director.Name,
  genre: movie.Genre.Name,
  image: movie.ImagePath,
  featured: movie.Featured,
  actors: movie.Actors,
});
