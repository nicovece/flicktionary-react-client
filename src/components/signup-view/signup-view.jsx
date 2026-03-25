import { useState } from 'react';
import { Form, Button, Col, Row, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { API_URL } from '../../config';
export const SignupView = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [birthday, setBirthday] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const validationErrors = [];
    if (username.length < 5) {
      validationErrors.push('Username must be at least 5 characters long.');
    }
    if (password.length < 8) {
      validationErrors.push('Password must be at least 8 characters long.');
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      validationErrors.push('Please enter a valid email address.');
    }
    if (!birthday) {
      validationErrors.push('Please enter your date of birth.');
    } else {
      const birthDate = new Date(birthday);
      const today = new Date();
      const minDate = new Date('1900-01-01');
      if (birthDate > today) {
        validationErrors.push('Date of birth cannot be in the future.');
      } else if (birthDate < minDate) {
        validationErrors.push('Please enter a valid date of birth.');
      } else {
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();
        const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
        if (actualAge < 13) {
          validationErrors.push('You must be at least 13 years old to sign up.');
        }
      }
    }
    if (validationErrors.length > 0) {
      setError(validationErrors.join('\n'));
      return;
    }

    const data = {
      Username: username,
      Password: password,
      Email: email,
      Birthday: birthday,
    };

    setIsLoading(true);
    fetch(`${API_URL}/users`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(async (response) => {
        if (response.ok) {
          setSuccess('Signup successful! You can now log in.');
          setUsername('');
          setPassword('');
          setEmail('');
          setBirthday('');
        } else {
          const data = await response.json().catch(() => null);
          if (data && data.errors) {
            const messages = data.errors.map((err) => err.msg);
            setError(messages.join('\n'));
          } else {
            setError('Signup failed. Please try again.');
          }
        }
      })
      .catch(() => {
        setError('Something went wrong. Please try again.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && (
        <Alert variant='danger' onClose={() => setError('')} dismissible>
          {error.split('\n').map((msg, i) => (
            <div key={i}>{msg}</div>
          ))}
        </Alert>
      )}
      {success && (
        <Alert variant='success' onClose={() => setSuccess('')} dismissible>
          {success} <Link to='/login'>Go to Login</Link>
        </Alert>
      )}
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
              minLength='5'
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
              minLength='8'
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
          <Button variant='primary' type='submit' className='btn-lg' disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner animation='border' size='sm' className='me-2' />
                Signing up...
              </>
            ) : (
              'Submit'
            )}
          </Button>
        </Col>
      </Row>
    </Form>
  );
};
