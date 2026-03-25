import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { MovieCard } from '../movie-card/movie-card';
import {
  Row,
  Col,
  Card,
  Button,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';
import PropTypes from 'prop-types';

export const MovieView = ({ movies, isMovieFavorite, onToggleFavorite }) => {
  const { movieId } = useParams();

  if (!movieId || !movies || movies.length === 0) {
    return <div>Loading...</div>;
  }

  const movie = movies.find((m) => m.id === movieId);

  if (!movie) {
    return <div>Movie not found</div>;
  }

  const isFavorite = isMovieFavorite(movieId);
  const similarMovies = movies.filter(
    (m) => m.genre === movie.genre && m.id !== movie.id
  );

  return (
    <>
      <Col md={10} lg={8}>
        <Card className='card--movieview'>
          <Card.Header className='d-flex justify-content-between align-items-center border-bottom border-secondary  mb-4 pb-4 card--movieview__header'>
            <Link to='/'>
              <Button variant='outline-primary'>Back to Movies list</Button>
            </Link>
            {onToggleFavorite && (
              <>
                <OverlayTrigger
                  key='top'
                  placement='top'
                  overlay={
                    <Tooltip
                      className={
                        isFavorite
                          ? 'favorite__tooltip favorite__tooltip--remove'
                          : 'favorite__tooltip favorite__tooltip--add'
                      }
                    >
                      {isFavorite
                        ? 'Remove from Favorites'
                        : 'Add to Favorites'}
                    </Tooltip>
                  }
                >
                  <Button
                    className='border-0 bg-transparent favorite__button'
                    onClick={() => onToggleFavorite(movieId)}
                  >
                    {isFavorite ? (
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='16'
                        height='16'
                        fill='currentColor'
                        viewBox='0 0 16 16'
                      >
                        <path
                          fillRule='evenodd'
                          d='M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314'
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='16'
                        height='16'
                        fill='currentColor'
                        viewBox='0 0 16 16'
                      >
                        <path d='m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15' />
                      </svg>
                    )}
                    <span className='visually-hidden'>
                      {isFavorite
                        ? 'Remove from Favorites'
                        : 'Add to Favorites'}
                    </span>
                  </Button>
                </OverlayTrigger>
              </>
            )}
          </Card.Header>
          <Card.Body>
            <Row className='justify-content-center'>
              <Col md={4}>
                <Card.Img
                  variant='top'
                  src={movie.image}
                  alt={movie.title}
                  className='mb-5 mb-md-0 card--movieview__image'
                />
              </Col>
              <Col md={8}>
                <Card.Title className='card--movieview__title h1'>
                  <h1>{movie.title}</h1>
                </Card.Title>
                <Card.Text>
                  <strong>Director:</strong> {movie.director}
                </Card.Text>
                <Card.Text>
                  <strong>Genre:</strong> {movie.genre}
                </Card.Text>
                <Card.Text>
                  <strong>Description:</strong> {movie.description}
                </Card.Text>
                <Card.Text>
                  <strong>Actors:</strong>{' '}
                  {Array.isArray(movie.actors)
                    ? movie.actors.join(', ')
                    : movie.actors}
                </Card.Text>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>

      {/* Similar Movies Section */}
      {similarMovies.length > 0 && (
        <Col className='mt-4 mb-5 col-12 similar-movies'>
          <Row className='border-bottom border-secondary mb-5'>
            <Col className='col-10 mx-auto mx-md-0 text-center text-md-start pb-3'>
              <h4>Other movies in the genre {movie.genre}:</h4>
            </Col>
          </Row>
          <Row>
            {similarMovies.map((similarMovie) => (
              <Col md={4} key={similarMovie.id} className='mb-3'>
                <MovieCard
                  movie={similarMovie}
                  isFavorite={isMovieFavorite(similarMovie.id)}
                  onToggleFavorite={onToggleFavorite}
                />
              </Col>
            ))}
          </Row>
        </Col>
      )}
    </>
  );
};

MovieView.propTypes = {
  movies: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      director: PropTypes.string.isRequired,
      genre: PropTypes.string.isRequired,
      image: PropTypes.string.isRequired,
      actors: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.string),
        PropTypes.string,
      ]).isRequired,
    })
  ).isRequired,
  isMovieFavorite: PropTypes.func.isRequired,
  onToggleFavorite: PropTypes.func.isRequired,
};
