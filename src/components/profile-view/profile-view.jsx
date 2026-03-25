import { useState, useEffect } from 'react';
import {
  Form,
  Button,
  Card,
  Row,
  Col,
  Container,
  Button,
  Modal,
} from 'react-bootstrap';
import { MovieCard } from '../moovie-card/movie-card';
import { useNavigate } from 'react-router-dom';

export const ProfileView = ({
  user,
  movies,
  favoriteMovies,
  onToggleFavorite,
  onLoggedOut,
}) => {
  const [userInfo, setUserInfo] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    dateOfBirth: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {
    if (!user) return;

    // Fetch user information
    fetch(`https://flicktionary.onrender.com/users/${user.Username}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((response) => response.json())
      .then((currentUser) => {
        setUserInfo(currentUser);
        setFormData({
          username: currentUser.Username,
          password: '',
          email: currentUser.Email,
          dateOfBirth: currentUser.Birthday
            ? new Date(currentUser.Birthday).toISOString().split('T')[0]
            : '',
        });
      })
      .catch(() => {
        setError('Failed to fetch user information');
      });
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const updateData = {
      Username: formData.username,
      Email: formData.email,
      Birthday: formData.dateOfBirth,
    };

    // Only include password if it's being changed
    if (formData.password) {
      updateData.Password = formData.password;
    }

    fetch(`https://flicktionary.onrender.com/users/${userInfo.Username}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(updateData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to update profile');
        }
        return response.json();
      })
      .then((updatedUser) => {
        setUserInfo(updatedUser);
        setSuccess('Profile updated successfully');
        // Clear password field after successful update
        setFormData((prev) => ({ ...prev, password: '' }));
      })
      .catch(() => {
        setError('Failed to update profile');
      });
  };

  const handleDeregister = () => {
    if (
      !window.confirm(
        'Are you sure you want to deregister? This action cannot be undone.'
      )
    ) {
      return;
    }

    fetch(`https://flicktionary.onrender.com/users/${userInfo.Username}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to deregister');
        }
        onLoggedOut();
        navigate('/login');
      })
      .catch(() => {
        setError('Failed to deregister');
      });
  };

  if (!userInfo) {
    return <div>Loading...</div>;
  }

  const favoriteMoviesList = movies.filter(
    (movie) => favoriteMovies && favoriteMovies.includes(movie.id)
  );

  return (
    <Col>
      <Row className='mb-5 py-5 justify-content-center'>
        <Col
          className='mb-5 pb-3 border-bottom border-secondary'
          md={10}
          lg={6}
        >
          <h3 className='mb-0'>Welcome {userInfo.Username}!</h3>
        </Col>
        <div className='w-100'></div>
        <Col md={6} lg={4}>
          <h5 className='mb-3'>Your profile information:</h5>
          <p>
            Username: <strong>{userInfo.Username}</strong>
          </p>
          <p>
            Email: <strong>{userInfo.Email}</strong>
          </p>
          <p>
            Date of Birth:{' '}
            <strong>
              {userInfo.Birthday
                ? new Date(userInfo.Birthday).toLocaleDateString()
                : 'Not set'}
            </strong>
          </p>
          <Modal show={show} onHide={handleClose}>
            <Form onSubmit={handleUpdateProfile}>
              <Modal.Header closeButton>
                <Modal.Title>Edit Profile</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Card>
                  <Card.Body>
                    {error && <div className='alert alert-danger'>{error}</div>}
                    {success && (
                      <div className='alert alert-success'>{success}</div>
                    )}

                    <Form.Group className='mb-3'>
                      <Form.Label>Username</Form.Label>
                      <Form.Control
                        type='text'
                        name='username'
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>

                    <Form.Group className='mb-3'>
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type='password'
                        name='password'
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder='Leave blank to keep current password'
                      />
                    </Form.Group>

                    <Form.Group className='mb-3'>
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type='email'
                        name='email'
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>

                    <Form.Group className='mb-3'>
                      <Form.Label>Date of Birth</Form.Label>
                      <Form.Control
                        type='date'
                        name='dateOfBirth'
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Card.Body>
                </Card>
              </Modal.Body>
              <Modal.Footer>
                <Button variant='secondary' onClick={handleClose}>
                  Close
                </Button>
                <Button variant='primary' type='submit' className='me-2'>
                  Update Profile
                </Button>
              </Modal.Footer>
            </Form>
          </Modal>
        </Col>
        <Col md={4} lg={2}>
          <div className='d-flex flex-column gap-4'>
            <Button variant='primary' size='lg' onClick={handleShow}>
              Edit Profile
            </Button>
            <Button
              variant='danger'
              type='button'
              size='lg'
              onClick={handleDeregister}
            >
              Deregister
            </Button>
          </div>
        </Col>
        <div className='w-100'></div>
        <Col className='mt-5 pt-3 movies--favorite'>
          <h3 className='my-5'>Favorite Movies</h3>
          {favoriteMoviesList.length === 0 ? (
            <p>No favorite movies yet.</p>
          ) : (
            <Row>
              {favoriteMoviesList.map((movie) => (
                <Col key={movie.id} md={4} className='mb-4'>
                  <MovieCard
                    movie={movie}
                    isFavorite={true}
                    onToggleFavorite={onToggleFavorite}
                  />
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>
    </Col>
  );
};
