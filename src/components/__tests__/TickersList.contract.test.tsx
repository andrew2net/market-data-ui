/** @jest-environment jsdom */
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import userEvent from '@testing-library/user-event';
import TickersList from '../TickersList';

// Mock the Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the API client
jest.mock('../../lib/useApiClient', () => ({
  useApiClient: jest.fn(),
}));

// Import the mocked useApiClient
import { useApiClient } from '../../lib/useApiClient';

const mockPush = jest.fn();
const mockApiClient = {
  get: jest.fn(),
};

describe('TickersList (contract-shaped payload)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (useApiClient as jest.Mock).mockReturnValue(mockApiClient);
  });

  it('renders using the Pact-like TickerResponse shape', async () => {
    mockApiClient.get.mockResolvedValue({
      status: 200,
      data: {
        data: [
          // Pact shape: id number, error_message null
          { id: '1', symbol: 'AAPL', name: 'Apple Inc.', status: 'enabled', error_message: null },
          { id: '2', symbol: 'GOOGL', name: 'Alphabet Inc.', status: 'disabled', error_message: 'Error' },
        ],
      },
    });

    await act(async () => {
      render(<TickersList />);
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading tickers...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Market Tickers')).toBeInTheDocument();
    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
    expect(screen.getByText('GOOGL')).toBeInTheDocument();
    expect(screen.getByText('Alphabet Inc.')).toBeInTheDocument();
    expect(screen.getByText('2 tickers available')).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByText('AAPL'));
    expect(mockPush).toHaveBeenCalledWith('/dashboard/ticker/1');
  });
});
