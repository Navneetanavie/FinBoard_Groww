"use client";
import { useState, useReducer } from "react";
import { ArrowRepeat, Eye } from "react-bootstrap-icons";
import { FieldsForm } from "./FieldsForm";

import { Fields, initialData } from "../constants";
import { WidgetFormState, WidgetFormAction } from "../types";

const formReducer = (state: WidgetFormState, action: WidgetFormAction): WidgetFormState => {
  if (action.type === 'UPDATE_FIELD') {
    const newState = { ...state, [action.field]: action.value };

    // 1. If API URL is changed, reset selected key and selected fields
    if (action.field === Fields.URL) {
      newState[Fields.DATA_KEY] = "";
      newState[Fields.FIELDS] = [];
    }

    // 2. If selected key is changed, reset selected fields
    if (action.field === Fields.DATA_KEY) {
      newState[Fields.FIELDS] = [];
    }

    // 3. If display mode is changed, reset selected fields
    if (action.field === Fields.DISPLAY_MODE) {
      newState[Fields.FIELDS] = [];
    }

    return newState;
  }
  return state;
};

export const WidgetForm = ({ onClose }: { onClose: () => void }) => {
  const [value, dispatch] = useReducer(formReducer, initialData);
  const [data, setData] = useState<any>();
  const [errorMessage, setErrorMessage] = useState<string>("");

  const updateValue = ({ key, _value }: { key: string; _value: WidgetFormState[keyof WidgetFormState] }) => {
    dispatch({ type: 'UPDATE_FIELD', field: key, value: _value });
    // Clear error when user makes changes
    if (errorMessage) setErrorMessage("");
  }

  const onAPIChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateValue({ key: Fields.URL, _value: e.target.value });
    setData(undefined);
  }

  const handleTest = async () => {
    try {
      const res = await fetch(value[Fields.URL]);
      const data = await res.json();
      setData(data);
    } catch (e) {
      console.log(e);
      setErrorMessage("Failed to fetch data from URL");
    }
  }

  const handleSave = () => {
    const isValid =
      value[Fields.NAME].trim().length > 0 &&
      value[Fields.URL].trim().length > 0 &&
      value[Fields.REFRESH_INTERVAL] > 0 &&
      value[Fields.DISPLAY_MODE] &&
      value[Fields.FIELDS].length > 0 &&
      value[Fields.DATA_KEY].trim().length > 0;

    if (!isValid) {
      setErrorMessage("Fill all the fields");
      return;
    };

    try {
      const existingWidgets = JSON.parse(localStorage.getItem("widgets") || "[]");
      localStorage.setItem("widgets", JSON.stringify([...existingWidgets, { ...value, id: value.id || crypto.randomUUID() }]));
      onClose();
    } catch (e) {
      console.error("Failed to save widget", e);
      setErrorMessage("Failed to save widget");
    }
  }

  return (
    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="w-160 bg-primary rounded-md flex flex-col max-h-[90vh]">
        <div className="border-b border-gray-800 px-5 py-3 text-l font-semibold">Add New Widget</div>
        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-2 mx-5 mt-4 rounded text-sm text-center">
            {errorMessage}
          </div>
        )}
        <div className="flex flex-col gap-4 p-5 overflow-y-auto">
          <div>
            <div className="text-sm mb-1">Widget Name</div>
            <input onChange={(e) => updateValue({ key: Fields.NAME, _value: e.target.value })} className="input-primary" type="text" placeholder="eg. Bitcoin Price Tracker" />
          </div>
          <div>
            <div className="text-sm mb-1">API URL</div>
            <div className="flex gap-2">
              <input onChange={onAPIChange} className="input-primary" type="text" placeholder="eg. https://api.coinbase.com/v2/exchange-rates?currency=BTC" />
              <button
                onClick={handleTest}
                className={value[Fields.URL] ? "button-primary" : "button-secondary"}
                style={{ height: "auto", padding: "0 10px" }}
                disabled={!value[Fields.URL]}
              >
                <ArrowRepeat size={20} className="mr-1" />Test
              </button>
            </div>
            {data && <div className="text-xs text-green-500 flex items-center gap-1 mt-1"> <Eye size={15} />API connection successful! 1 top-level fields found.</div>}
          </div>
          <div>
            <div className="text-sm mb-1">Refresh Interval (seconds)</div>
            <input onChange={(e) => updateValue({ key: Fields.REFRESH_INTERVAL, _value: Number(e.target.value) })} className="input-primary" type="number" placeholder="eg. 30" />
          </div>
          {data && <FieldsForm data={data} formValue={value} onFormChange={updateValue} />}
        </div>
        <div className="flex justify-end border-t border-gray-800 px-5 py-3 gap-2">
          <button className="button-secondary" onClick={onClose}>Cancel</button>
          <button className="button-primary" onClick={handleSave}>Add Widget</button>
        </div>
      </div>
    </div>
  );
}; 
