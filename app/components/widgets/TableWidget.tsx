import { useEffect, useState, useRef } from "react";
import { ArrowRepeat, Gear, Trash, Table as TableIcon, Search, ChevronLeft, ChevronRight } from "react-bootstrap-icons";
import { getTableData } from "../../helpers";
import type { WidgetFormState } from "../../types";

const ITEMS_PER_PAGE = 8;

export const TableWidget = ({ widgetData }: { widgetData: WidgetFormState }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

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

  if (loading && !data) return <div className="animate-pulse bg-[var(--tertiary)] rounded-xl h-48 w-full border border-gray-800"></div>;
  if (error) return <div className="text-red-400 bg-red-500/10 p-4 rounded-xl border border-red-500/20 text-sm">{error}</div>;

  const { columnKeys, tableValues } = getTableData({ widgetData, fetchedData: data });

  const filteredRows = tableValues.filter(row => {
    if (!searchTerm) return true;
    const lowerTerm = searchTerm.toLowerCase();
    return columnKeys.some((col: any) => {
      return String(row[col.key]).toLowerCase().includes(lowerTerm);
    });
  });

  const totalPages = Math.ceil(filteredRows.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRows = filteredRows.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="bg-[var(--tertiary)] border border-gray-800 rounded-xl px-5 pt-3 pb-3 shadow-sm h-135 flex flex-col overflow-hidden w-fit">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="text-gray-400">
            <TableIcon size={16} />
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

      <div className="mb-3 relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[var(--secondary)]">
          <Search size={12} />
        </div>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearch}
          className="bg-[#151725] border border-gray-800 rounded-md py-1.5 pl-8 pr-3 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[var(--secondary)] transition-colors w-full min-w-150"
        />
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar border border-gray-800 rounded-lg">
        <table className="text-left border-collapse w-full">
          <thead className="bg-[#151725] text-xs text-center sticky top-0 z-10">
            <tr>
              {columnKeys.map((col, idx) => (
                <th key={idx} className="p-3 font-medium text-gray-400 border-b border-gray-800 whitespace-nowrap px-6">
                  {col.label || col.key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-sm">
            {paginatedRows.length > 0 ? (
              paginatedRows.map((row: any, rowIndex: number) => (
                <tr key={rowIndex} className="border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                  {columnKeys.map((col: any, cellIndex) => {
                    const value = row[col.key];

                    return (
                      <td key={cellIndex} className={`p-3 text-center text-gray-300 whitespace-nowrap max-w-[200px] truncate px-6 ${col.isPrimary ? 'font-semibold text-white' : ''}`} title={String(value)}>
                        {value !== undefined && value !== null ? String(value) : "-"}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columnKeys.length} className="p-8 text-center text-gray-500 text-xs">
                  {searchTerm ? "No matching records found" : "No data available"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex justify-between items-center text-[10px] text-gray-600 font-medium">
        <span>Updated: {lastUpdated ? lastUpdated.toLocaleTimeString([], { hour12: false }) : "--:--:--"}</span>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1 hover:text-white disabled:opacity-30 disabled:hover:text-gray-600 transition-colors"
            >
              <ChevronLeft size={10} />
            </button>
            <span className="text-gray-400">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1 hover:text-white disabled:opacity-30 disabled:hover:text-gray-600 transition-colors"
            >
              <ChevronRight size={10} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};