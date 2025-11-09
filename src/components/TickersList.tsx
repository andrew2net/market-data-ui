"use client";

import { useEffect, useState } from "react";
import { useApiClient } from "../lib/useApiClient";

interface Ticker {
  symbol: string;
  name: string;
}

interface TickersResponse {
  data: Ticker[];
}

export default function TickersList() {
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const apiClient = useApiClient();

  useEffect(() => {
    const fetchTickers = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get<TickersResponse>('/tickers');

        if (response.error) {
          setError(response.error);
        } else if (response.data?.data) {
          setTickers(response.data.data);
        } else {
          setError('No ticker data received');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tickers');
      } finally {
        setLoading(false);
      }
    };

    fetchTickers();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading tickers...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 m-4">
        <div className="flex">
          <div className="text-red-800">
            <h3 className="text-sm font-medium">Error loading tickers</h3>
            <div className="mt-2 text-sm">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (tickers.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        No tickers available
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Market Tickers</h3>
        <p className="text-sm text-gray-600 mt-1">
          {tickers.length} ticker{tickers.length !== 1 ? 's' : ''} available
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {tickers.map((ticker) => (
          <div key={ticker.symbol} className="px-6 py-4 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  {ticker.symbol}
                </h4>
                <p className="text-sm text-gray-600">{ticker.name}</p>
              </div>
              <div className="text-xs text-gray-400 font-mono">
                {ticker.symbol}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
