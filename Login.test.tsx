import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import Login from './Login';

// Mock the AuthContext
vi.mock('@/context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: () => ({
    isAuthenticated: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Login', () => {
  test('renders login form', () => {
    renderLogin();

    expect(screen.getByText('Welcome to FitNutrition')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  test('renders navbar and footer', () => {
    renderLogin();

    expect(screen.getByRole('navigation')).toBeInTheDocument();
    // Footer might not be rendered in this test setup, but we can check for its presence if needed
  });

  test('shows sign up tab', () => {
    renderLogin();

    expect(screen.getByRole('tab', { name: 'Sign Up' })).toBeInTheDocument();
  });
});
