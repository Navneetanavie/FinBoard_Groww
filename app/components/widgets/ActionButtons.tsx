import { ArrowRepeat, Gear, Trash } from "react-bootstrap-icons";

interface ActionButtonsProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  onSettings?: () => void;
  onDelete?: () => void;
}

export const ActionButtons = ({ onRefresh, isRefreshing, onSettings, onDelete }: ActionButtonsProps) => {
  return (
    <div className="flex items-center gap-3 text-gray-500">
      <button onClick={onRefresh} className="hover:text-gray-300 transition-colors" title="Refresh">
        <ArrowRepeat size={14} className={isRefreshing ? "animate-spin" : ""} />
      </button>
      <button onClick={onSettings} className="hover:text-gray-300 transition-colors" title="Settings">
        <Gear size={14} />
      </button>
      <button onClick={onDelete} className="hover:text-red-400 transition-colors" title="Delete">
        <Trash size={14} />
      </button>
    </div>
  );
};
