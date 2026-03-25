import PropTypes from 'prop-types';
import { Button, Card, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export const MovieCard = ({ movie, isFavorite, onToggleFavorite }) => {
  const handleToggleFavorite = (e) => {
    e.preventDefault(); // Prevent navigation when clicking the button
    e.stopPropagation(); // Stop event propagation

    if (onToggleFavorite && movie && movie.id) {
      onToggleFavorite(movie.id);
    }
  };

  return (
    <Card className='h-100 p-5 p-md-3 d-flex flex-column flex-md-row align-items-center border border-secondary card--movie'>
      <Link to={`/movies/${movie.id}`} className='card__image'>
        <Card.Img
          variant='top'
          src={movie.image}
          alt={`${movie.title} movie poster`}
        />
        <span className='visually-hidden'>link to {movie.title} info page</span>
      </Link>
      <Card.Body>
        <Card.Title className='card__title text-light'>
          <Link to={`/movies/${movie.id}`}>
            <h4>{movie.title}</h4>
          </Link>
        </Card.Title>
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
                  {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                </Tooltip>
              }
            >
              <Button
                className='mt-2 border-0 bg-transparent favorite__button'
                onClick={handleToggleFavorite}
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
                  {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                </span>
              </Button>
            </OverlayTrigger>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

MovieCard.propTypes = {
  movie: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    image: PropTypes.string,
  }).isRequired,
  isFavorite: PropTypes.bool,
  onToggleFavorite: PropTypes.func,
};
