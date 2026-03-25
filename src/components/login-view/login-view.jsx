import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { API_URL } from '../../config';
export const LoginView = ({ onLoggedIn }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    // this prevents the default behavior of the form which is to reload the entire page
    event.preventDefault();
    setError('');

    const data = {
      Username: username,
      Password: password,
    };

    fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.user) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          onLoggedIn(data.user, data.token);
        } else {
          setError('Invalid username or password');
        }
      })
      .catch(() => {
        setError('Something went wrong. Please try again.');
      });
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && <Alert variant='danger' onClose={() => setError('')} dismissible>{error}</Alert>}
      <div className='d-flex justify-content-between align-items-center border-bottom border-secondary mb-4 pb-3'>
        <h4 className='mb-0'>Login</h4>
        <span>
          <i className='me-4'>or</i>
          <Link to='/signup'>
            <Button variant='outline-primary'>Signup</Button>
          </Link>
        </span>
      </div>
      <Form.Group controlId='formUsername' className='mb-4'>
        <Form.Label className='text-info'>Username:</Form.Label>
        <Form.Control
          type='text'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          minLength='3'
          className='border-primary'
        />
      </Form.Group>

      <Form.Group controlId='formPassword' className='mb-4'>
        <Form.Label className='text-info'>Password:</Form.Label>
        <Form.Control
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className='border-primary'
        />
      </Form.Group>
      <Button variant='primary' type='submit' className='btn-lg'>
        Submit
      </Button>
    </Form>
  );
};
