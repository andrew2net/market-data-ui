"use client";

import { useEffect, useRef, useState } from "react";
import type { IChartApi, ISeriesApi, CandlestickData, LineData, Time } from "lightweight-charts";
import { useApiClient } from "@/lib/useApiClient";

interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  value: number;
}

interface CandlesResponse {
  columns: string[];
  data: number[][];
}

interface TickerCandlesChartProps {
  tickerId: string;
  period?: string;
  dateFrom?: string;
  dateTo?: string;
}

function getDefaultDateRange(): { dateFrom: string; dateTo: string } {
  const now = new Date();
  const dateTo = now.toISOString().split("T")[0];
  const dateFrom = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    .toISOString()
    .split("T")[0];
  return { dateFrom, dateTo };
}

export default function TickerCandlesChart({
  tickerId,
  period = "month",
  dateFrom: dateFromProp,
  dateTo: dateToProp
}: TickerCandlesChartProps) {
  const defaults = getDefaultDateRange();
  const dateFrom = dateFromProp ?? defaults.dateFrom;
  const dateTo = dateToProp ?? defaults.dateTo;
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const lineSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [candles, setCandles] = useState<CandleData[] | null>(null);
  const apiClient = useApiClient();

  useEffect(() => {
    if (!chartContainerRef.current) return;

    let chart: IChartApi | null = null;
    let handleResize: (() => void) | null = null;

    const initChart = async () => {
      const { createChart, CandlestickSeries, LineSeries } = await import("lightweight-charts");

      if (!chartContainerRef.current) return;

      // Create chart
      chart = createChart(chartContainerRef.current, {
        layout: {
          background: { color: "#ffffff" },
          textColor: "#333",
        },
        grid: {
          vertLines: { color: "#e1e1e1" },
          horzLines: { color: "#e1e1e1" },
        },
        width: chartContainerRef.current.clientWidth,
        height: 400,
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
        },
      });

      // Create candlestick series
      const candlestickSeries = chart.addSeries(CandlestickSeries, {
        upColor: "#26a69a",
        downColor: "#ef5350",
        borderVisible: false,
        wickUpColor: "#26a69a",
        wickDownColor: "#ef5350",
      });

      // Create line series for value (on separate scale)
      const lineSeries = chart.addSeries(LineSeries, {
        color: "#2962FF",
        lineWidth: 2,
        priceScaleId: "right",
      });

      chartRef.current = chart;
      candlestickSeriesRef.current = candlestickSeries;
      lineSeriesRef.current = lineSeries;

      // When chart is created, if we already have candles, push them into series
      if (candles) {
        const candleData: CandlestickData[] = candles.map((candle) => ({
          time: candle.time as Time,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
        }));

        const valueData: LineData[] = candles.map((candle) => ({
          time: candle.time as Time,
          value: candle.value,
        }));

        candlestickSeries.setData(candleData);
        lineSeries.setData(valueData);
        chart.timeScale().fitContent();
      }

      // Handle window resize
      handleResize = () => {
        if (chartContainerRef.current && chartRef.current) {
          chartRef.current.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      };

      window.addEventListener("resize", handleResize);
    };

    initChart();

    // Cleanup
    return () => {
      if (handleResize) {
        window.removeEventListener("resize", handleResize);
      }
      if (chart) {
        chart.remove();
        chartRef.current = null;
      }
    };
  }, [candles]);

  useEffect(() => {
    const fetchCandles = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({ period });
        if (dateFrom) params.append("date_from", dateFrom);
        if (dateTo) params.append("date_to", dateTo);

        const response = await apiClient.get<CandlesResponse>(
          `/tickers/${tickerId}/candles?${params.toString()}`
        );

        if (response.error) {
          setError(response.error);
          setLoading(false);
          return;
        }

        if (!response.data?.data || !Array.isArray(response.data.data)) {
          setError("No candle data received");
          setLoading(false);
          return;
        }

        const { columns, data } = response.data;
        const timeIdx = columns.indexOf("time");
        const openIdx = columns.indexOf("open");
        const highIdx = columns.indexOf("high");
        const lowIdx = columns.indexOf("low");
        const closeIdx = columns.indexOf("close");
        const valueIdx = columns.indexOf("value");

        const candles: CandleData[] = data.map((row) => ({
          time: String(row[timeIdx]),
          open: row[openIdx],
          high: row[highIdx],
          low: row[lowIdx],
          close: row[closeIdx],
          value: row[valueIdx],
        }));

        setCandles(candles);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch candle data");
        setLoading(false);
      }
    };

    fetchCandles();
  }, [apiClient, tickerId, period, dateFrom, dateTo]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8 bg-gray-50 rounded-lg" style={{ height: 400 }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading chart data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800">
          <h4 className="text-sm font-medium">Error loading chart</h4>
          <div className="mt-2 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Price Chart ({period})</h4>
        <div className="flex gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#26a69a]"></div>
            <span>Price (Candlestick)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-[#2962FF]"></div>
            <span>Value (Line)</span>
          </div>
        </div>
      </div>
      <div ref={chartContainerRef} />
    </div>
  );
}
