import { useEffect, useState } from "react";
import { getSelectableFields } from "../helpers";

import { Plus, X } from 'react-bootstrap-icons'
import { DisplayMode, Fields } from "../constants";
import { selectedField } from "../types";
import { Dropdown } from "./Dropdown";

export const FieldsForm = ({ data, formValue, onFormChange }: { data: any, formValue: any, onFormChange: ({ key, _value }: { key: string, _value: any }) => void }) => {
  const selectedFields = formValue[Fields.FIELDS];
  const displayMode = formValue[Fields.DISPLAY_MODE];
  const dataKey = formValue[Fields.DATA_KEY];
  const dataKeyLabel = formValue[Fields.DATA_KEY_LABEL];

  const [searchTerm, setSearchTerm] = useState("");

  const { selectableFields, path, isKeyDefined } = getSelectableFields({ data, widgetType: displayMode }) ?? {};

  useEffect(() => {
    if (isKeyDefined) {
      onFormChange({ key: Fields.DATA_KEY, _value: path });
    }
  }, []);

  const handleAddField = (path: selectedField) => {
    if (selectedFields.some((field: selectedField) => field.path === path.path)) return;
    onFormChange({ key: Fields.FIELDS, _value: [...selectedFields, path] });
  }

  const handleRemoveField = (path: selectedField) => {
    onFormChange({ key: Fields.FIELDS, _value: selectedFields.filter((field: selectedField) => field.path !== path.path) });
  };

  const handleUpdateLabel = (path: string, label: string) => {
    onFormChange({
      key: Fields.FIELDS,
      _value: selectedFields.map((field: selectedField) =>
        field.path === path ? { ...field, label } : field
      )
    });
  };

  const handleKeyChange = (value: string) => {
    onFormChange({ key: Fields.DATA_KEY, _value: value });
  };

  const handleModeChange = (mode: DisplayMode) => {
    onFormChange({ key: Fields.DISPLAY_MODE, _value: mode });
  };

  const filteredFields = selectableFields?.filter((field: any) => {
    const matchesSearch = field.path.toLowerCase().includes(searchTerm.toLowerCase());
    const isAlreadySelected = selectedFields.some((selected: selectedField) => selected.path === field.path);
    const isNumericForChart = displayMode === DisplayMode.CHART ? field.type === 'number' : true;
    const isDataKey = !isKeyDefined && field.path === dataKey;

    return matchesSearch && !isAlreadySelected && isNumericForChart && !isDataKey;
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="text-sm mb-1">Display Mode</div>
        <div className="flex gap-2">
          <button
            onClick={() => handleModeChange(DisplayMode.CARD)}
            className={displayMode === DisplayMode.CARD ? "button-primary" : "button-secondary"}
          >
            Card
          </button>
          <button
            onClick={() => handleModeChange(DisplayMode.TABLE)}
            className={displayMode === DisplayMode.TABLE ? "button-primary" : "button-secondary"}
          >
            Table
          </button>
          <button
            onClick={() => handleModeChange(DisplayMode.CHART)}
            className={displayMode === DisplayMode.CHART ? "button-primary" : "button-secondary"}
          >
            Chart
          </button>
        </div>
        {displayMode !== DisplayMode.CARD && (
          <label className="text-xs text-gray-400">Showing only array fields since for table or chart view</label>
        )}
      </div>
      {displayMode !== DisplayMode.CARD && (
        <div>
          <div className="text-sm mb-1 text-white">Select Key</div>
          {isKeyDefined ?
            <div
              className={`input-primary flex items-center justify-between bg-[var(--primary)] cursor-not-allowed`}
            >
              <span className={`truncate`}>
                {path}
              </span>
            </div> :
            <Dropdown
              options={selectableFields?.filter((field: any) => field.type === 'string')?.map((field: any) => ({ label: field.path, value: field.path, type: field.type })) || []}
              value={isKeyDefined ? path : dataKey}
              onChange={handleKeyChange}
              placeholder="Select a key"
              className="w-full mb-4"
            />
          }
          <div>
            <div className="text-sm mb-1 text-white">Key Label</div>
            <input
              className="input-primary"
              type="text"
              placeholder="Enter the label for the selected key"
              value={dataKeyLabel}
              onChange={(e) => onFormChange({ key: Fields.DATA_KEY_LABEL, _value: e.target.value })}
            />
          </div>
        </div>
      )}
      <div>
        <div className="text-sm mb-1">Search Fields to display</div>
        <div className="flex flex-col gap-2 mb-2">
          <input
            className="input-primary"
            type="text"
            placeholder="Search for fields..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-400 mb-2">Available Fields</div>
            <div className="h-40 overflow-y-auto border border-gray-700 rounded p-2 flex flex-col gap-1">
              {filteredFields?.map((path: any) => (
                <div key={path.path} className="flex items-center justify-between p-1 hover:bg-white/5 rounded">
                  <div className="flex items-center min-w-0 mr-2">
                    <span className="text-sm truncate" title={path.path}>{path.path}</span>
                    <span className="text-[10px] text-gray-500 border border-gray-700 rounded px-1 ml-2 bg-black/20 shrink-0">{path.type}</span>
                  </div>
                  <button className="button-secondary p-1" onClick={() => handleAddField(path)}><Plus size={16} /></button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-400 mb-2">Selected Fields</div>
            <div className="h-40 overflow-y-auto border border-gray-700 rounded p-2 flex flex-col gap-1">
              {selectedFields.map((field: selectedField) => (
                <div key={field.path} className="flex items-center justify-between p-1 hover:bg-white/5 rounded gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-400 truncate mb-1" title={field.path}>{field.path}</div>
                    <input
                      type="text"
                      className="w-full bg-black/20 border border-gray-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-[var(--secondary)]"
                      placeholder="Custom Label"
                      value={field.label || ""}
                      onChange={(e) => handleUpdateLabel(field.path, e.target.value)}
                    />
                  </div>
                  <button className="button-secondary p-1 hover:text-red-400 shrink-0" onClick={() => handleRemoveField(field)}><X size={16} /></button>
                </div>
              ))}
              {selectedFields.length === 0 && <div className="text-xs text-gray-500 text-center py-4">No fields selected</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
