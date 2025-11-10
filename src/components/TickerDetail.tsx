"use client";

import { useEffect, useState } from "react";
import { useApiClient } from "../lib/useApiClient";

interface TickerDetailData {
  id: string;
  symbol: string;
  name: string;
}

interface TickerDetailProps {
  tickerId: string;
  onBack: () => void;
}

export default function TickerDetail({ tickerId, onBack }: TickerDetailProps) {
  const [ticker, setTicker] = useState<TickerDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const apiClient = useApiClient();

  useEffect(() => {
    const fetchTickerDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get<{ data: TickerDetailData }>(`/tickers/${tickerId}`);

        if (response.error) {
          setError(response.error);
        } else if (response.data?.data) {
          setTicker(response.data.data);
        } else {
          setError('No ticker detail data received');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch ticker details');
      } finally {
        setLoading(false);
      }
    };

    fetchTickerDetail();
  }, [apiClient, tickerId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading ticker details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 m-4">
        <div className="flex">
          <div className="text-red-800">
            <h3 className="text-sm font-medium">Error loading ticker details</h3>
            <div className="mt-2 text-sm">{error}</div>
          </div>
        </div>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
        >
          ← Back to list
        </button>
      </div>
    );
  }

  if (!ticker) {
    return (
      <div className="text-center p-8 text-gray-500">
        No ticker details available
        <button
          onClick={onBack}
          className="block mt-4 mx-auto px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
        >
          ← Back to list
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{ticker.symbol}</h3>
            <p className="text-sm text-gray-600 mt-1">{ticker.name}</p>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
          >
            ← Back to list
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Price Information</h4>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Market Data</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
