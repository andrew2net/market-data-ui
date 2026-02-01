/** @jest-environment jsdom */
import { render, screen, waitFor, act } from '@testing-library/react';
import { PactV3, MatchersV3 } from '@pact-foundation/pact';
import { ApiClient } from '@/lib/api';

// Mock lightweight-charts to avoid requiring the real package in tests
jest.mock('lightweight-charts', () => {
  const mockSeries = { setData: jest.fn() };
  const chart = {
    addSeries: jest.fn(() => mockSeries),
    timeScale: () => ({ fitContent: jest.fn() }),
    applyOptions: jest.fn(),
    remove: jest.fn(),
  };
  return {
    createChart: () => chart,
    CandlestickSeries: { type: 'Candlestick' },
    LineSeries: { type: 'Line' },
  };
}, { virtual: true });

import TickerCandlesChart from '../TickerCandlesChart';

const { eachLike, like } = MatchersV3;

// Allow injecting a real ApiClient whose baseUrl we set at runtime
let apiClient: ApiClient;
jest.mock('../../lib/useApiClient', () => ({
  useApiClient: () => apiClient,
}));

describe('TickerCandlesChart + Pact', () => {
  const provider = new PactV3({
    consumer: 'market-data-ui',
    provider: 'market-data-api',
    dir: 'pacts',
    logLevel: 'warn',
  });

  beforeEach(() => {
    // Ensure Authorization header is attached by ApiClient (default requiresAuth: true)
    (localStorage.getItem as jest.Mock).mockReturnValue('token');
  });

  it('renders with candles data from the Pact mock server', async () => {
    provider
      .given('Candles exist for ticker 1 for month period within date range')
      .uponReceiving('a request for monthly candles for ticker 1 with date range')
      .withRequest({
        method: 'GET',
        path: '/api/v1/tickers/1/candles',
        query: { period: 'month', date_from: '2025-01-01', date_to: '2025-01-31' },
      })
      .willRespondWith({
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: {
          columns: ['time', 'open', 'high', 'low', 'close', 'value'],
          data: eachLike(
            [
              like(1735689600), // time (UTC timestamp in seconds)
              like(100.12),    // open
              like(110.42),    // high
              like(95.0),      // low
              like(105.88),    // close
              like(12345.67),  // value
            ],
            2
          ),
        },
      });

    await provider.executeTest(async (mockServer) => {
      apiClient = new ApiClient(mockServer.url);
      const getSpy = jest.spyOn(apiClient, 'get');

      await act(async () => {
        render(<TickerCandlesChart tickerId="1" period="month" dateFrom="2025-01-01" dateTo="2025-01-31" />);
      });

      // Ensure the API call was made to the expected endpoint
      await waitFor(() => {
        expect(getSpy).toHaveBeenCalled();
      }, { timeout: 5000 });

      await waitFor(() => {
        expect(screen.queryByText('Loading chart data...')).not.toBeInTheDocument();
      }, { timeout: 5000 });

      // Validate key UI elements for the chart
      expect(screen.getByText('Price Chart (month)')).toBeInTheDocument();
      expect(screen.getByText('Price (Candlestick)')).toBeInTheDocument();
      expect(screen.getByText('Value (Line)')).toBeInTheDocument();
    });
  }, 10000);
});
