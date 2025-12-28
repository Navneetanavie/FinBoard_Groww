import { useEffect, useState, useRef } from "react";
import { ArrowRepeat, Gear, Trash, GraphUp, ExclamationCircle } from "react-bootstrap-icons";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { findArrayField, findHomogeneousField } from "../../helpers";
import type { WidgetFormState } from "../../types";

const getValueByPath = (obj: any, path: string) => {
  if (!obj) return null;
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

const getRelativePath = (fullPath: string, rootPath: string) => {
  if (!rootPath) return fullPath;
  if (fullPath.startsWith(rootPath + '.')) {
    return fullPath.slice(rootPath.length + 1);
  }
  return fullPath;
}

// Custom Tooltip for Dark Theme
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1e2035] border border-gray-700 p-3 rounded shadow-lg text-xs">
        <p className="text-gray-300 mb-2 font-semibold">{label}</p>
        {payload.map((p: any, index: number) => (
          <p key={index} style={{ color: p.color }} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></span>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const COLORS = ["#00bd80", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export const ChartWidget = ({ widgetData }: { widgetData: WidgetFormState }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // Data processing logic (Same as TableWidget to extract the list)
  let chartData: any[] = [];
  let rootPath = "";

  const arrayField = findArrayField({ obj: data });
  const homogeneousField = findHomogeneousField({ obj: data });

  if (homogeneousField && widgetData.dataKey === homogeneousField.path) {
    rootPath = homogeneousField.path;
    chartData = Object.entries(homogeneousField.obj).map(([key, value]) => ({ ...(value as object), _key: key }));
  } else if (arrayField) {
    rootPath = arrayField.path;
    chartData = arrayField.array;
  }

  // Flatten data for Recharts (Recharts likes simple objects)
  const formattedData = chartData.map((item, index) => {
    const flattenedItem: any = { _index: index }; // Fallback X-Axis

    // X-Axis Value
    if (widgetData.dataKey) {
      if (rootPath && widgetData.dataKey.startsWith(rootPath)) { // If dataKey is deep
        // If the dataKey is actually pointing to the array itself or a property inside
        // For Charts, dataKey usually implies the X-Axis Label Field
        // If widgetData.dataKey == rootPath, it means the user selected the array itself as key? 
        // Let's assume widgetData.dataKey acts as the Unique ID column for X-Axis
      }

      if (isHomogeneous(item)) { // If specific logic needed
        // Using _key from above
        flattenedItem[widgetData.dataKey] = item._key;
      }
    }

    // Populate Y-Axis Fields
    widgetData.fields.forEach(field => {
      const relativePath = getRelativePath(field.path, rootPath);
      const value = getValueByPath(item, relativePath);
      flattenedItem[field.path] = isNumber(value) ? Number(value) : value;
    });

    // Handle X-Axis explicitly
    // If the user selected a "Key" in the form, that's our X-Axis candidate
    if (widgetData.dataKey) {
      const relativeKeyPath = getRelativePath(widgetData.dataKey, rootPath);
      flattenedItem._xAxis = getValueByPath(item, relativeKeyPath) || item._key || index;
    } else {
      flattenedItem._xAxis = index;
    }

    return flattenedItem;
  });

  // Helper to check for number
  function isNumber(n: any) { return !isNaN(parseFloat(n)) && isFinite(n); }
  function isHomogeneous(i: any) { return i._key !== undefined; }

  if (loading && !data) return <div className="animate-pulse bg-[var(--tertiary)] rounded-xl h-64 w-full border border-gray-800"></div>;
  if (error) return <div className="text-red-400 bg-red-500/10 p-4 rounded-xl border border-red-500/20 text-sm">{error}</div>;

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
        <div className="flex items-center gap-3 text-gray-500">
          <button onClick={refreshNow} className="hover:text-gray-300 transition-colors" title="Refresh">
            <ArrowRepeat size={14} className={loading && data ? "animate-spin" : ""} />
          </button>
          <button className="hover:text-gray-300 transition-colors" title="Settings">
            <Gear size={14} />
          </button>
          <button className="hover:text-red-400 transition-colors" title="Delete">
            <Trash size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        {formattedData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis
                dataKey="_xAxis"
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
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
              {widgetData.fields.map((field, index) => (
                <Line
                  key={field.path}
                  type="monotone"
                  dataKey={field.path}
                  name={field.label || field.path}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3, strokeWidth: 0 }}
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

      <div className="mt-2 text-center">
        <span className="text-[10px] text-gray-600 font-medium">
          Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString([], { hour12: false }) : "--:--:--"}
        </span>
      </div>
    </div>
  )
}