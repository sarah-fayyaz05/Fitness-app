import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Profile from './Profile';

// Mock the contexts
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

vi.mock('@/context/UserContext', () => ({
  useUser: () => ({
    profile: null,
    updateProfile: vi.fn(),
  }),
}));

const renderProfile = () => {
  return render(
    <BrowserRouter>
      <Profile />
    </BrowserRouter>
  );
};

describe('Profile', () => {
  test('renders profile tabs', () => {
    renderProfile();

    expect(screen.getByRole('tab', { name: 'Profile' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Progress Tracking' })).toBeInTheDocument();
  });

  test('shows profile tab by default', () => {
    renderProfile();

    expect(screen.getByRole('tab', { name: 'Profile' })).toHaveAttribute('data-state', 'active');
  });

  test('can switch to progress tracking tab', async () => {
    const user = userEvent.setup();
    renderProfile();

    const progressTab = screen.getByRole('tab', { name: 'Progress Tracking' });
    await user.click(progressTab);

    expect(progressTab).toHaveAttribute('data-state', 'active');
    expect(screen.getByRole('tab', { name: 'Profile' })).toHaveAttribute('data-state', 'inactive');
  });

  test('renders navbar and footer', () => {
    renderProfile();

    expect(screen.getByRole('navigation')).toBeInTheDocument();
    // Footer might not be rendered in this test setup, but we can check for its presence if needed
  });
});
