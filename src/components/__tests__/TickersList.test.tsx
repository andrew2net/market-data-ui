import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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

  test('renders loading state initially', () => {
    // Make the API call hang to test loading state
    mockApiClient.get.mockImplementation(() => new Promise(() => {}));

    render(<TickersList />);

    expect(screen.getByText('Loading tickers...')).toBeInTheDocument();
  });

  test('renders tickers successfully', async () => {
    const mockTickersData = {
      data: {
        data: [
          { symbol: 'AAPL', name: 'Apple Inc.' },
          { symbol: 'GOOGL', name: 'Alphabet Inc.' },
          { symbol: 'MSFT', name: 'Microsoft Corporation' },
        ],
      },
    };

    mockApiClient.get.mockResolvedValue(mockTickersData);

    render(<TickersList />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading tickers...')).not.toBeInTheDocument();
    });

    // Check if tickers are rendered
    expect(screen.getByText('Market Tickers')).toBeInTheDocument();
    expect(screen.getByText('3 tickers available')).toBeInTheDocument();

    expect(screen.getAllByText('AAPL')).toHaveLength(2); // Symbol appears twice
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument();

    expect(screen.getAllByText('GOOGL')).toHaveLength(2); // Symbol appears twice
    expect(screen.getByText('Alphabet Inc.')).toBeInTheDocument();

    expect(screen.getAllByText('MSFT')).toHaveLength(2); // Symbol appears twice
    expect(screen.getByText('Microsoft Corporation')).toBeInTheDocument();
  });

  test('renders error state when API call fails', async () => {
    const errorResponse = {
      error: 'Failed to fetch tickers',
      status: 500,
    };

    mockApiClient.get.mockResolvedValue(errorResponse);

    render(<TickersList />);

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

    render(<TickersList />);

    await waitFor(() => {
      expect(screen.getByText('No tickers available')).toBeInTheDocument();
    });
  });

  test('calls correct API endpoint', () => {
    render(<TickersList />);

    expect(mockApiClient.get).toHaveBeenCalledWith('/tickers');
  });

  test('handles network errors gracefully', async () => {
    mockApiClient.get.mockRejectedValue(new Error('Network error'));

    render(<TickersList />);

    await waitFor(() => {
      expect(screen.getByText('Error loading tickers')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  test('renders singular ticker count correctly', async () => {
    const singleTickerData = {
      data: {
        data: [
          { symbol: 'AAPL', name: 'Apple Inc.' },
        ],
      },
    };

    mockApiClient.get.mockResolvedValue(singleTickerData);

    render(<TickersList />);

    await waitFor(() => {
      expect(screen.getByText('1 ticker available')).toBeInTheDocument();
    });
  });
});
