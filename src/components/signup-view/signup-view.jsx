import { useState } from 'react';
import { Form, Button, Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { API_URL } from '../../config';
export const SignupView = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [birthday, setBirthday] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    const data = {
      Username: username,
      Password: password,
      Email: email,
      Birthday: birthday,
    };

    fetch(`${API_URL}/users`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      if (response.ok) {
        alert('Signup successful');
        window.location.reload();
      } else {
        alert('Signup failed');
      }
    });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        <Col className='col-12 d-flex justify-content-between align-items-center border-bottom border-secondary mb-4 pb-3'>
          <h4 className='mb-0'>Signup</h4>
          <span>
            <i className='me-4'>or</i>
            <Link to='/login'>
              <Button variant='outline-primary'>Login</Button>
            </Link>
          </span>
        </Col>
        <Col className='col-12 col-md-6'>
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
            <Form.Text className='text-muted'>
              Must be 5 or more characters
            </Form.Text>
          </Form.Group>
        </Col>
        <Col className='col-12 col-md-6'>
          <Form.Group controlId='formPassword' className='mb-4'>
            <Form.Label className='text-info'>Password:</Form.Label>
            <Form.Control
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='border-primary'
              required
            />
            <Form.Text className='text-muted'>
              Must be 8 or more characters, including uppercase, lowercase,
              numbers, and special characters (!@#$%^&*-_=+;:,.)
            </Form.Text>
          </Form.Group>
        </Col>
        <Col className='col-12 col-md-6'>
          <Form.Group controlId='formEmail' className='mb-4'>
            <Form.Label className='text-info'>Email:</Form.Label>
            <Form.Control
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='border-primary'
              required
            />
          </Form.Group>
        </Col>
        <Col className='col-12 col-md-6'>
          <Form.Group controlId='formBirthday' className='mb-5'>
            <Form.Label className='text-info'>Birthday:</Form.Label>
            <Form.Control
              type='date'
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className='border-primary'
              required
            />
          </Form.Group>
        </Col>
        <Col className='col-12 col-md-6'>
          <Button variant='primary' type='submit' className='btn-lg'>
            Submit
          </Button>
        </Col>
      </Row>
    </Form>
  );
};
