import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockFetch = jest.fn();

global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('ContactManagement Component', () => {
  it('renders correctly', () => {
    render(<ContactManagement />);
    expect(screen.getByTestId('contact_management-container')).toBeInTheDocument();
  });

  it('handles adding a new contact', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([{ id: 1, name: 'John Doe', email: 'john@example.com', phone: '1234567890' }]) });
    render(<ContactManagement />);
    const addNameInput = screen.getByPlaceholderText(/name/i);
    const addEmailInput = screen.getByPlaceholderText(/email/i);
    const addPhoneInput = screen.getByPlaceholderText(/phone/i);
    const addButton = screen.getByRole('button', { name: /add contact/i });

    userEvent.type(addNameInput, 'John Doe');
    userEvent.type(addEmailInput, 'john@example.com');
    userEvent.type(addPhoneInput, '1234567890');
    userEvent.click(addButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.ainative.studio/api/v1/contacts',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-API-Key': expect.any(String),
          }),
          body: JSON.stringify({ name: 'John Doe', email: 'john@example.com', phone: '1234567890' }),
        })
      );
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching contacts', async () => {
    mockFetch.mockReturnValueOnce(new Promise((resolve) => setTimeout(resolve, 100)));
    render(<ContactManagement />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
  });

  it('handles API errors when fetching contacts', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Failed to fetch contacts'));
    render(<ContactManagement />);
    await waitFor(() => {
      expect(screen.getByText(/error fetching contacts/i)).toBeInTheDocument();
    });
  });

  it('is accessible', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([{ id: 1, name: 'John Doe', email: 'john@example.com', phone: '1234567890' }]) });
    render(<ContactManagement />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /contact management/i })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /phone/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add contact/i })).toBeInTheDocument();
      expect(screen.getByRole('listitem', { name: /john doe/i })).toBeInTheDocument();
    });
  });
});