import { extractPaths } from "../helpers";
import { selectedField, Fields } from "./WidgetForm";
import { Plus, X } from 'react-bootstrap-icons'

export const FieldsForm = ({ data, selectedFields, onFormChange }: { data: any, selectedFields: selectedField[], onFormChange: ({ key, _value }: { key: string, _value: any }) => void }) => {
  const paths = extractPaths({ obj: data });
  const handleAddField = (path: selectedField) => {
    if (selectedFields.some((field) => field.path === path.path)) return;
    onFormChange({ key: Fields.FIELDS, _value: [...selectedFields, path] });
  }

  const handleRemoveField = (path: selectedField) => {
    onFormChange({ key: Fields.FIELDS, _value: selectedFields.filter((field) => field.path !== path.path) });
  };
  return (
    <>
      <div className="text-sm mb-1"> Select Fields to display
        <div className="text-xs mb-1"> Display Mode
          <div className="flex gap-2">
            <button className="button-secondary"> Card </button>
            <button className="button-secondary"> Table </button>
            <button className="button-secondary"> Chart </button>
          </div>
        </div>
      </div>
      <div>
        <div className="text-sm mb-1">Search Fields</div>
        <input className="input-primary" type="text" placeholder="Search for fields..." />
        <input type="checkbox" className="ml-2" />
        <label className="text-xs">Show arrays only (for table view)</label>
      </div>
      <div>
        <div className="text-sm mb-1">Available Fields</div>
        <div className="max-h-30 overflow-y-scroll flex flex-col gap-1">
          {paths.map((path: any) => (
            <div key={path.path} className="flex items-center gap-2">
              <button className="button-secondary" onClick={() => handleAddField(path)}><Plus size={20} /></button>
              <label>{path.path}</label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="text-sm mb-1">Selected Fields</div>
        <div className="max-h-30 overflow-y-scroll flex flex-col gap-1">
          {selectedFields.map((field: selectedField) => (
            <div key={field.path} className="flex items-center gap-2">
              <button className="button-secondary" onClick={() => handleRemoveField(field)}><X size={20} /></button>
              <label>{field.path}</label>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
