"use client";
import { useState } from "react";
import { useApiClient } from "../../lib/useApiClient";
import TopNavBar from "../../components/TopNavBar";
import TickersList from "../../components/TickersList";

export default function DashboardPage() {
  const apiClient = useApiClient();
  const [data, setData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setError(null);
    try {
      const response = await apiClient.get<{ message: string }>('/protected');

      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.data) {
        setData(response.data.message);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <TopNavBar />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-700">Dashboard</h1>

        {/* Tickers Section */}
        <div className="mb-8">
          <TickersList />
        </div>
      </div>
    </div>
  );
}
