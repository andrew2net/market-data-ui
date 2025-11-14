import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { useRouter } from 'next/navigation';
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

describe('TickersList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (useApiClient as jest.Mock).mockReturnValue(mockApiClient);
  });

  test('renders loading state initially', async () => {
    // Make the API call take a while to test loading state
    let resolvePromise: (value: { data: { data: unknown[] } }) => void;
    const mockPromise = new Promise<{ data: { data: unknown[] } }>((resolve) => {
      resolvePromise = resolve;
    });
    mockApiClient.get.mockReturnValue(mockPromise);

    await act(async () => {
      render(<TickersList />);
    });

    expect(screen.getByText('Loading tickers...')).toBeInTheDocument();

    // Resolve the promise to clean up
    await act(async () => {
      resolvePromise!({ data: { data: [] } });
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading tickers...')).not.toBeInTheDocument();
    });
  });

  test('renders tickers successfully', async () => {
    const mockTickersData = {
      data: {
        data: [
          { id: '1', symbol: 'AAPL', name: 'Apple Inc.', status: 'active', error_message: '' },
          { id: '2', symbol: 'GOOGL', name: 'Alphabet Inc.', status: 'active', error_message: '' },
          { id: '3', symbol: 'MSFT', name: 'Microsoft Corporation', status: 'active', error_message: '' },
        ],
      },
    };

    mockApiClient.get.mockResolvedValue(mockTickersData);

    await act(async () => {
      render(<TickersList />);
    });

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading tickers...')).not.toBeInTheDocument();
    });

    // Check if tickers are rendered
    expect(screen.getByText('Market Tickers')).toBeInTheDocument();
    expect(screen.getByText('3 tickers available')).toBeInTheDocument();

    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument();

    expect(screen.getByText('GOOGL')).toBeInTheDocument();
    expect(screen.getByText('Alphabet Inc.')).toBeInTheDocument();

    expect(screen.getByText('MSFT')).toBeInTheDocument();
    expect(screen.getByText('Microsoft Corporation')).toBeInTheDocument();
  });

  test('renders error state when API call fails', async () => {
    const errorResponse = {
      error: 'Failed to fetch tickers',
      status: 500,
    };

    mockApiClient.get.mockResolvedValue(errorResponse);

    await act(async () => {
      render(<TickersList />);
    });

    await waitFor(() => {
      expect(screen.getByText('Error loading tickers')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch tickers')).toBeInTheDocument();
    });
  });

  test('renders empty state when no tickers are returned', async () => {
    const emptyResponse = {
      data: {
        data: [],
      },
    };

    mockApiClient.get.mockResolvedValue(emptyResponse);

    await act(async () => {
      render(<TickersList />);
    });

    await waitFor(() => {
      expect(screen.getByText('No tickers available')).toBeInTheDocument();
    });
  });

  test('calls correct API endpoint', async () => {
    await act(async () => {
      render(<TickersList />);
    });

    expect(mockApiClient.get).toHaveBeenCalledWith('/tickers');
  });

  test('handles network errors gracefully', async () => {
    mockApiClient.get.mockRejectedValue(new Error('Network error'));

    await act(async () => {
      render(<TickersList />);
    });

    await waitFor(() => {
      expect(screen.getByText('Error loading tickers')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  test('renders singular ticker count correctly', async () => {
    const singleTickerData = {
      data: {
        data: [
          { id: '1', symbol: 'AAPL', name: 'Apple Inc.', status: 'active', error_message: '' },
        ],
      },
    };

    mockApiClient.get.mockResolvedValue(singleTickerData);

    await act(async () => {
      render(<TickersList />);
    });

    await waitFor(() => {
      expect(screen.getByText('1 ticker available')).toBeInTheDocument();
    });
  });
});
