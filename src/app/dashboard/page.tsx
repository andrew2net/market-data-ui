"use client";
import TickersList from "../../components/TickersList";

export default function DashboardPage() {
  return (
    <div>
      {/* Tickers Section */}
      <div className="mb-8">
        <TickersList />
      </div>
    </div>
  );
}
