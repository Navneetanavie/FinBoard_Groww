"use client";
import { ActionButtons } from "./ActionButtons";
import { useEffect, useState, useRef } from "react";
import { GraphUp, ExclamationCircle, Dash, Plus, ChevronLeft, ChevronRight } from "react-bootstrap-icons";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getTableData } from "../../helpers";
import type { WidgetFormState } from "../../types";

const COLORS = ["#00bd80", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export const ChartWidget = ({ widgetData, onDelete, onEdit }: { widgetData: WidgetFormState; onDelete: () => void; onEdit: () => void }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Pagination and Zoom State
  const [itemsPerPage, setItemsPerPage] = useState<number>(500);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const fetchData = async () => {
    try {
      const res = await fetch(widgetData.url);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json);
      setLastUpdated(new Date());
      setError("");
    } catch (e) {
      console.error(e);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = widgetData.refreshInterval > 0
      ? setInterval(fetchData, widgetData.refreshInterval * 1000)
      : null;

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [widgetData.url, widgetData.refreshInterval]);

  const refreshNow = () => {
    setLoading(true);
    fetchData();
  };

  const { columnKeys: columnKeys, tableValues } = data ? getTableData({ widgetData, fetchedData: data }) : { columnKeys: [], tableValues: [] };

  const normalizedColumnKeys = columnKeys.map((col) => ({
    key: col.key.replace(/[^a-zA-Z0-9_]/g, "_"),
    label: col.label
  }))

  // Pagination Logic
  const totalPages = Math.ceil(tableValues.length / itemsPerPage);

  // Ensure current page is valid when data/itemsPerPage changes
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, itemsPerPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDataValues = tableValues.slice(startIndex, startIndex + itemsPerPage);

  // Normalize keys in formatted data
  const formattedData = paginatedDataValues.map((item: any) => {
    const normalizedItem: any = {};
    normalizedColumnKeys.forEach((col, index) => {
      normalizedItem[col.key] = item[columnKeys[index].key];
    })
    return normalizedItem;
  });

  const handleZoomIn = () => {
    setItemsPerPage(prev => Math.max(10, prev - 10));
  };

  const handleZoomOut = () => {
    setItemsPerPage(prev => Math.min(1000, prev + 10));
  };

  const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value);
    if (isNaN(val)) val = 10; // default min
    if (val > 1000) val = 1000;
    setItemsPerPage(val);
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };


  // if (loading && !data) return <div className="animate-pulse bg-[var(--tertiary)] rounded-xl h-64 w-full border border-gray-800"></div>;
  // if (error) return <div className="text-red-400 bg-red-500/10 p-4 rounded-xl border border-red-500/20 text-sm">{error}</div>;

  return (
    <div className="bg-[var(--tertiary)] border border-gray-800 rounded-xl px-5 pt-3 pb-3 shadow-sm h-full flex flex-col w-full min-h-[300px]">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-3">
          <div className="text-gray-400">
            <GraphUp size={16} />
          </div>
          <span className="font-semibold text-gray-200 text-sm tracking-wide">{widgetData.name}</span>
          {widgetData.refreshInterval > 0 && (
            <span className="bg-gray-800 text-gray-500 text-[10px] px-1.5 py-0.5 rounded font-medium">
              {widgetData.refreshInterval}s
            </span>
          )}
        </div>
        <ActionButtons
          onRefresh={refreshNow}
          isRefreshing={loading && !!data}
          onDelete={onDelete}
          onSettings={onEdit}
        />
      </div>

      <div className="w-full h-100">
        {formattedData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis
                dataKey={normalizedColumnKeys[0].key}
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF', fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: '#4B5563' }}
              />
              <YAxis
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                domain={['auto', 'auto']}
              />
              <Tooltip contentStyle={{ backgroundColor: "#1e2035", borderColor: "#374151", color: "#f3f4f6" }} itemStyle={{ color: "#f3f4f6" }} />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
              {normalizedColumnKeys.slice(1).map((col, index) => (
                <Line
                  key={col.key}
                  type="monotone"
                  dataKey={col.key}
                  name={col.label}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 0, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-2">
            <ExclamationCircle size={24} />
            <span className="text-xs">No chart data available</span>
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-gray-800 pt-2">
        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Points</span>
          <div className="flex items-center gap-1 bg-black/20 rounded p-0.5 border border-gray-700">
            <button
              onClick={handleZoomIn}
              className="p-1 hover:text-white text-gray-400 disabled:opacity-50"
              disabled={itemsPerPage <= 10}
              title="Zoom In (Fewer Points)"
            >
              <Dash size={12} />
            </button>
            <input
              type="number"
              value={itemsPerPage}
              onChange={handlePointsChange}
              className="w-12 bg-transparent text-center text-xs text-gray-300 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              onClick={handleZoomOut}
              className="p-1 hover:text-white text-gray-400 disabled:opacity-50"
              disabled={itemsPerPage >= 1000}
              title="Zoom Out (More Points)"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>

        {/* Info */}
        <span className="text-[10px] text-gray-600 font-medium">
          Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString([], { hour12: false }) : "--:--:--"}
        </span>

        {/* Pagination Controls */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500">
            {currentPage} / {totalPages || 1}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="p-1 hover:text-white text-gray-400 disabled:opacity-30 disabled:hover:text-gray-400"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1 hover:text-white text-gray-400 disabled:opacity-30 disabled:hover:text-gray-400"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}