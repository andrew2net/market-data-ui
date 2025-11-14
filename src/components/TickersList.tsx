"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApiClient } from "../lib/useApiClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TickerBadge from "./TickerBadge";

interface Ticker {
  id: string;
  symbol: string;
  name: string;
  status: string;
  error_message: string;
}

interface TickersResponse {
  data: Ticker[];
}

export default function TickersList() {
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
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
  }, [apiClient]);

  const handleShowTicker = (ticker: Ticker) => {
    router.push(`/dashboard/ticker/${ticker.id}`);
  };

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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-25">Symbol</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="w-22 text-center">Staus</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickers.map((ticker) => (
            <TableRow
              key={ticker.symbol}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleShowTicker(ticker)}
            >
              <TableCell className="font-medium">{ticker.symbol}</TableCell>
              <TableCell>{ticker.name}</TableCell>
              <TableCell className="text-center">
                <TickerBadge status={ticker.status} error_message={ticker.error_message} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
