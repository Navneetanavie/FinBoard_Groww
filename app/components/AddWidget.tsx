import { Plus } from "react-bootstrap-icons";


export const AddWidget = ({ onAddWidget }: { onAddWidget?: () => void }) => {
  return (
    <div className="border border-dashed border-[var(--primary)] px-2 py-5 rounded flex flex-col gap-3 items-center justify-center w-50">
      <button className="bg-primary w-10 h-10 rounded-full cursor-pointer flex items-center justify-center" onClick={onAddWidget}><Plus size={20} /></button>
      <div className="text-center font-bold">Add Widget</div>
      <div className="text-xs text-center text-gray-500">
        Connect to a finance API and create a custom widget
      </div>
    </div>
  );
};