/** @jest-environment jsdom */
import { render, screen, waitFor, act } from '@testing-library/react';
import { PactV3, MatchersV3 } from '@pact-foundation/pact';
import { ApiClient } from '../../lib/api';
import TickersList from '../TickersList';

const { eachLike, like } = MatchersV3;

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Allow injecting a real ApiClient whose baseUrl we set at runtime
let apiClient: ApiClient;
jest.mock('../../lib/useApiClient', () => ({
  useApiClient: () => apiClient,
}));

describe('TickersList + Pact', () => {
  const provider = new PactV3({
    consumer: 'market-data-ui',
    provider: 'market-data-api',
    port: 1234,
    dir: 'pacts',
    logLevel: 'warn',
  });

  beforeEach(() => {
    (localStorage.getItem as jest.Mock).mockReturnValue("token");
  });

  it('renders with data from the Pact mock server', async () => {
    provider
      .given('Tickers exist with error message')
      .uponReceiving('a request for tickers with error_message as string')
      .withRequest({ method: 'GET', path: '/api/v1/tickers' })
      .willRespondWith({
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: {
          data: eachLike(
            {
              id: like('1'), // Pact shape
              symbol: like('MSFT'),
              name: like('Microsoft Corp.'),
              status: like('disabled'),
              last_fetched: null,
              error_message: 'Some error',
            },
            1
          ),
        },
      });

    await provider.executeTest(async (mockServer) => {
      apiClient = new ApiClient(mockServer.url);

      await act(async () => {
        render(<TickersList />);
      });

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading tickers...')).not.toBeInTheDocument();
      }, { timeout: 5000 });

      expect(screen.getByText('MSFT')).toBeInTheDocument();
      expect(screen.getByText('Microsoft Corp.')).toBeInTheDocument();
      expect(screen.getByText('1 ticker available')).toBeInTheDocument();
    });
  });
});
