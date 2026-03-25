import { useState, useEffect } from 'react';
import { MovieCard } from '../moovie-card/movie-card';
import { MovieView } from '../movie-view/movie-view';
import { LoginView } from '../login-view/login-view';
import { SignupView } from '../signup-view/signup-view';
import { NavigationBar } from '../navigation-bar/navigation-bar';
import { ProfileView } from '../profile-view/profile-view';
import { SearchResultsView } from '../searchresults-view/searchresults-view';
import { Footer } from '../footer/footer';
import { Row, Col, Container } from 'react-bootstrap';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

// MainViewContent component that uses useLocation
const MainView = () => {
  const location = useLocation();
  const storedUser = JSON.parse(localStorage.getItem('user'));
  const storedToken = localStorage.getItem('token');
  // movies to be displayed
  const [movies, setMovies] = useState([]);
  // user's favorite movies
  const [favoriteMovies, setFavoriteMovies] = useState([]);

  // user
  const [user, setUser] = useState(storedUser ? storedUser : null);
  // token
  const [token, setToken] = useState(storedToken ? storedToken : null);

  // Fetch movies from API
  useEffect(() => {
    if (!token) return;
    fetch('https://flicktionary.onrender.com/movies', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        const moviesFromApi = data.map((movie) => ({
          id: movie._id,
          title: movie.Title,
          description: movie.Description,
          director: movie.Director.Name,
          genre: movie.Genre.Name,
          image: movie.ImagePath,
          featured: movie.Featured,
          actors: movie.Actors,
        }));

        setMovies(moviesFromApi);
      });
  }, [token]);

  // Fetch user's favorite movies from user object
  useEffect(() => {
    if (!user || !token) return;

    fetch(`https://flicktionary.onrender.com/users/${user.Username}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((userData) => {
        if (userData.FavoriteMovies) {
          setFavoriteMovies(userData.FavoriteMovies);
        }
      })
      .catch(() => {});
  }, [user, token]);

  // Function to toggle favorite status
  const toggleFavorite = (movieId) => {
    if (!user || !token) return;

    const isFavorite = favoriteMovies.includes(movieId);

    let updatedFavorites;

    if (isFavorite) {
      // Remove from favorites
      updatedFavorites = favoriteMovies.filter((id) => id !== movieId);
    } else {
      // Add to favorites
      updatedFavorites = [...favoriteMovies, movieId];
    }

    // First, update the local state to provide immediate feedback
    setFavoriteMovies(updatedFavorites);

    // Update the user in localStorage
    const updatedUser = { ...user, FavoriteMovies: updatedFavorites };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);

    // Use the correct endpoint structure for adding/removing favorite movies
    const endpoint = `https://flicktionary.onrender.com/users/${user.Username}/movies/${movieId}`;
    const method = isFavorite ? 'DELETE' : 'POST';

    // Update user's favorite movies in the database
    fetch(endpoint, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        const responseText = await response.text();

        if (response.ok) {
          try {
            const responseData = JSON.parse(responseText);

            // Update the state with the server response
            if (responseData.FavoriteMovies) {
              setFavoriteMovies(responseData.FavoriteMovies);
              const newUser = {
                ...user,
                FavoriteMovies: responseData.FavoriteMovies,
              };
              localStorage.setItem('user', JSON.stringify(newUser));
              setUser(newUser);
            }
          } catch (e) {
            // Response is not JSON
          }
        } else {
          // Revert the local state if the server update fails
          setFavoriteMovies(favoriteMovies);
          localStorage.setItem('user', JSON.stringify(user));
          setUser(user);
        }
      })
      .catch(() => {
        // Revert the local state if the server update fails
        setFavoriteMovies(favoriteMovies);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
      });
  };

  // Check if a movie is in favorites
  const isMovieFavorite = (movieId) => {
    return favoriteMovies.includes(movieId);
  };

  return (
    <>
      <Container fluid>
        <NavigationBar
          user={user}
          pathname={location.pathname}
          onLoggedOut={() => {
            setUser(null);
            localStorage.clear();
          }}
        />
      </Container>
      <Container>
        <Row
          className={
            location.pathname !== '/'
              ? 'justify-content-center ' + location.pathname.slice(1)
              : 'justify-content-start'
          }
        >
          <Routes>
            <Route
              path='/signup'
              element={
                <>
                  {user ? (
                    <Navigate to='/' />
                  ) : (
                    <Col md={10} xl={8}>
                      <SignupView />
                    </Col>
                  )}
                </>
              }
            />
            <Route
              path='/login'
              element={
                <>
                  {user ? (
                    <Navigate to='/' />
                  ) : (
                    <Col md={5}>
                      <LoginView
                        onLoggedIn={(user, token) => {
                          setUser(user);
                          setToken(token);
                        }}
                      />
                    </Col>
                  )}
                </>
              }
            />
            <Route
              path='/profile'
              element={
                <>
                  {!user ? (
                    <Navigate to='/login' replace />
                  ) : (
                    <ProfileView
                      user={user}
                      movies={movies}
                      favoriteMovies={favoriteMovies}
                      onToggleFavorite={toggleFavorite}
                      onLoggedOut={() => {
                        setUser(null);
                        localStorage.clear();
                      }}
                    />
                  )}
                </>
              }
            />
            <Route
              path='/'
              element={
                <>
                  {!user ? (
                    <Navigate to='/login' />
                  ) : (
                    <SearchResultsView
                      user={user}
                      token={token}
                      onToggleFavorite={toggleFavorite}
                      isMovieFavorite={isMovieFavorite}
                    />
                  )}
                </>
              }
            />
            <Route
              path='/movies/:movieId'
              element={
                <>
                  {!user ? (
                    <Navigate to='/login' replace />
                  ) : movies.length === 0 ? (
                    <Col>The list is empty!</Col>
                  ) : (
                    <MovieView
                      movies={movies}
                      isFavorite={isMovieFavorite(
                        movies.find(
                          (m) => m.id === location.pathname.split('/')[2]
                        )?.id
                      )}
                      onToggleFavorite={toggleFavorite}
                    />
                  )}
                </>
              }
            />
          </Routes>
        </Row>
      </Container>
      <Footer
        user={user}
        pathname={location.pathname}
        onLoggedOut={() => {
          setUser(null);
          localStorage.clear();
        }}
      />
    </>
  );
};

export default MainView;
