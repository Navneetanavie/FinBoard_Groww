import { useEffect, useState } from "react";
import { Collection } from "react-bootstrap-icons";
import { ActionButtons } from "./ActionButtons";
import { getValueByPath } from "../../helpers";
import type { WidgetEntity } from "../../types";

export const CardWidget = ({ widgetData, onDelete, onEdit }: { widgetData: WidgetEntity; onDelete: () => void; onEdit: () => void }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

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
    const interval = setInterval(fetchData, widgetData.refreshInterval * 1000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [widgetData.url, widgetData.refreshInterval]);

  const refreshNow = () => {
    setLoading(true);
    fetchData();
  };

  if (loading && !data) return <div className="animate-pulse bg-[var(--tertiary)] border border-gray-800 rounded-xl px-5 pt-3 pb-1 shadow-sm h-50 w-full flex items-center justify-center">Loading...</div>;
  if (error) return <div className="text-red-400 bg-[var(--tertiary)] border border-gray-800 rounded-xl px-5 pt-3 pb-1 shadow-sm h-50 w-full flex items-center justify-center">{error}</div>;

  return (
    <div className="h-full w-full">
      <div className="bg-[var(--tertiary)] border border-gray-800 rounded-xl flex flex-col px-5 pt-3 pb-1 shadow-sm ">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="text-gray-400">
              <Collection size={16} />
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

        <div className="flex-1 flex flex-col gap-3 overflow-y-auto custom-scrollbar">
          {widgetData.fields.map((field, index) => {
            const value = getValueByPath(data, field.path);
            return (
              <div key={index} className="flex justify-between items-baseline border-b last:border-0 border-gray-800/50 pb-2 last:pb-0">
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">{field.label || field.path}</span>
                <span className="text-sm font-bold text-gray-100 truncate max-w-[60%]" title={String(value)}>
                  {value !== undefined && value !== null ? String(value) : "-"}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <span className="text-[10px] text-gray-600 font-medium">
            Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString([], { hour12: false }) : "--:--:--"}
          </span>
        </div>
      </div>
    </div>
  )
}