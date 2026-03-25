import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MainView from './main-view';

// Mock child components to isolate routing logic
jest.mock('../login-view/login-view', () => ({
  LoginView: () => <div data-testid="login-view">LoginView</div>,
}));
jest.mock('../signup-view/signup-view', () => ({
  SignupView: () => <div data-testid="signup-view">SignupView</div>,
}));
jest.mock('../profile-view/profile-view', () => ({
  ProfileView: () => <div data-testid="profile-view">ProfileView</div>,
}));
jest.mock('../searchresults-view/searchresults-view', () => ({
  SearchResultsView: () => <div data-testid="search-view">SearchResultsView</div>,
}));
jest.mock('../navigation-bar/navigation-bar', () => ({
  NavigationBar: () => <div data-testid="navbar">Nav</div>,
}));
jest.mock('../footer/footer', () => ({
  Footer: () => <div data-testid="footer">Footer</div>,
}));
jest.mock('../movie-view/movie-view', () => ({
  MovieView: () => <div data-testid="movie-view">MovieView</div>,
}));

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve([]),
  });
});

afterEach(() => {
  localStorage.clear();
  jest.restoreAllMocks();
});

const renderAtRoute = (route) =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <MainView />
    </MemoryRouter>
  );

describe('MainView route protection', () => {
  describe('when logged out', () => {
    it('redirects / to /login', () => {
      renderAtRoute('/');
      expect(screen.getByTestId('login-view')).toBeInTheDocument();
      expect(screen.queryByTestId('search-view')).not.toBeInTheDocument();
    });

    it('redirects /profile to /login', () => {
      renderAtRoute('/profile');
      expect(screen.getByTestId('login-view')).toBeInTheDocument();
      expect(screen.queryByTestId('profile-view')).not.toBeInTheDocument();
    });

    it('shows login view at /login', () => {
      renderAtRoute('/login');
      expect(screen.getByTestId('login-view')).toBeInTheDocument();
    });

    it('shows signup view at /signup', () => {
      renderAtRoute('/signup');
      expect(screen.getByTestId('signup-view')).toBeInTheDocument();
    });
  });

  describe('when logged in', () => {
    beforeEach(() => {
      localStorage.setItem('user', JSON.stringify({ Username: 'testuser' }));
      localStorage.setItem('token', 'fake-token');
    });

    it('redirects /login to /', () => {
      renderAtRoute('/login');
      expect(screen.getByTestId('search-view')).toBeInTheDocument();
      expect(screen.queryByTestId('login-view')).not.toBeInTheDocument();
    });

    it('redirects /signup to /', () => {
      renderAtRoute('/signup');
      expect(screen.getByTestId('search-view')).toBeInTheDocument();
      expect(screen.queryByTestId('signup-view')).not.toBeInTheDocument();
    });

    it('shows search view at /', () => {
      renderAtRoute('/');
      expect(screen.getByTestId('search-view')).toBeInTheDocument();
    });

    it('shows profile view at /profile', () => {
      renderAtRoute('/profile');
      expect(screen.getByTestId('profile-view')).toBeInTheDocument();
    });
  });
});
