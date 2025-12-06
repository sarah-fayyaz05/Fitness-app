import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ContactUs from './ContactUs';

// Mock the AuthContext
vi.mock('@/context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: () => ({
    isAuthenticated: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

// Mock fetch
global.fetch = vi.fn();

const renderContactUs = () => {
  return render(
    <BrowserRouter>
      <ContactUs />
    </BrowserRouter>
  );
};

describe('ContactUs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders contact form', () => {
    renderContactUs();

    expect(screen.getByText('Send us a Message')).toBeInTheDocument();
    expect(screen.getByLabelText('Full Name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address *')).toBeInTheDocument();
    expect(screen.getByLabelText('Subject *')).toBeInTheDocument();
    expect(screen.getByLabelText('Message *')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send Message' })).toBeInTheDocument();
  });

  test('shows loading state during submission', async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockImplementationOnce(() =>
      new Promise(resolve => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: () => Promise.resolve({ success: true }),
          });
        }, 100);
      })
    );

    renderContactUs();

    await user.type(screen.getByLabelText('Full Name *'), 'John Doe');
    await user.type(screen.getByLabelText('Email Address *'), 'john@example.com');
    await user.type(screen.getByLabelText('Subject *'), 'Test Subject');
    await user.type(screen.getByLabelText('Message *'), 'Test message');

    const submitButton = screen.getByRole('button', { name: 'Send Message' });
    await user.click(submitButton);

    expect(submitButton).toHaveTextContent('Your message will be sent...');
    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(submitButton).toHaveTextContent('Message Sent!');
    });
  });

  test('handles form submission error', async () => {
    const user = userEvent.setup();
    const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Server error' }),
    });

    renderContactUs();

    await user.type(screen.getByLabelText('Full Name *'), 'John Doe');
    await user.type(screen.getByLabelText('Email Address *'), 'john@example.com');
    await user.type(screen.getByLabelText('Subject *'), 'Test Subject');
    await user.type(screen.getByLabelText('Message *'), 'Test message');

    const submitButton = screen.getByRole('button', { name: 'Send Message' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Server error');
    });

    expect(submitButton).toHaveTextContent('Send Message');
    expect(submitButton).not.toBeDisabled();

    mockAlert.mockRestore();
  });

  test('renders contact information', () => {
    renderContactUs();

    expect(screen.getByText('Contact Information')).toBeInTheDocument();
    expect(screen.getAllByText('support@fitnutrition.com')).toHaveLength(2);
    expect(screen.getAllByText('+1 (555) 123-4567')).toHaveLength(2);
  });

  test('renders FAQ section', () => {
    renderContactUs();

    expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
    expect(screen.getByText('How do I create a diet plan?')).toBeInTheDocument();
    expect(screen.getByText('Can I track my progress?')).toBeInTheDocument();
  });
});
