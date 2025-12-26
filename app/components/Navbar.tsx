import { BarChartLine, Plus, Dot } from "react-bootstrap-icons";

export const Navbar = ({ activeWidgets = 0, onAddWidget }: { activeWidgets?: number, onAddWidget?: () => void }) => {
  return (
    <div className="flex justify-between px-10 py-2 border-b border-gray-800 items-center bg-[#1e2035]">
      <div className="flex items-center">
        <div className="bg-[var(--primary)] p-1 rounded align-items-center h-fit"><BarChartLine size={20} /></div>
        <div>
          <div className="text-l font-bold px-2">Finance Dashboard</div>
          <div className="text-xs px-2 flex items-center">{activeWidgets} active widget <Dot size={15} />Real-time data</div>
        </div>

      </div>
      <button className="flex items-center bg-primary px-2 py-1 rounded align-items-center h-fit cursor-pointer text-sm" onClick={onAddWidget}><Plus size={20} />Add Widget</button>
    </div >
  );
};