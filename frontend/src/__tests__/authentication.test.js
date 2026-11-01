import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('node-fetch', () => jest.fn());

import Authentication from '../components/Authentication';

describe('Authentication Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders correctly', () => {
    render(<Authentication />);
    const container = screen.getByTestId('authentication-container');
    expect(container).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('handles user interactions', async () => {
    render(<Authentication />);
    userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    userEvent.type(screen.getByLabelText(/password/i), 'password123');
    userEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.ainative.studio/api/v1/auth',
        expect.any(Object)
      );
    });
  });

  test('shows loading state', async () => {
    global.fetch.mockImplementationOnce(() =>
      new Promise((resolve) => setTimeout(resolve, 500))
    );

    render(<Authentication />);
    userEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(screen.getByText(/loading.../i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText(/loading.../i)).not.toBeInTheDocument();
    });
  });

  test('handles API errors', async () => {
    global.fetch.mockRejectedValueOnce(new Error('API error'));

    render(<Authentication />);
    userEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed to authenticate/i)).toBeInTheDocument();
    });
  });

  test('is accessible', () => {
    render(<Authentication />);
    expect(screen.getByLabelText(/email/i)).toHaveAccessibleName(/email/i);
    expect(screen.getByLabelText(/password/i)).toHaveAccessibleName(/password/i);
    expect(screen.getByRole('button', { name: /login/i })).toBeEnabled();
  });
});