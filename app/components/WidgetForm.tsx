"use client";
import { useState } from "react";
import { ArrowRepeat, Eye } from "react-bootstrap-icons";
import { FieldsForm } from "./FieldsForm";

enum DisplayMode {
  TABLE = "table",
  CHART = "chart",
  CARD = "card"
}

export enum Fields {
  NAME = "name",
  URL = "url",
  REFRESH_INTERVAL = "refreshInterval",
  DISPLAY_MODE = "displayMode",
  FIELDS = "fields"
}

export type selectedField = {
  path: string;
  value: any;
  type: string;
}

type value = {
  [Fields.NAME]: string;
  [Fields.URL]: string;
  [Fields.REFRESH_INTERVAL]: number;
  [Fields.DISPLAY_MODE]: DisplayMode;
  [Fields.FIELDS]: selectedField[];
}

const initialData: value = {
  [Fields.NAME]: "",
  [Fields.URL]: "",
  [Fields.REFRESH_INTERVAL]: 0,
  [Fields.DISPLAY_MODE]: DisplayMode.TABLE,
  [Fields.FIELDS]: []
}

export const WidgetForm = () => {
  const [value, setValue] = useState<value>(initialData);
  const [data, setData] = useState<any>();

  const updateValue = ({ key, _value }: { key: string; _value: value[keyof value] }) => {
    setValue((prev) => ({ ...prev, [key]: _value }));
  }

  const handleTest = async () => {
    try {
      const res = await fetch(value[Fields.URL]);
      const data = await res.json();
      setData(data);
    } catch (e) {
      console.log(e);
    }
  }
  return (
    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
      <div className="w-160 bg-primary rounded-md">
        <div className="border-b border-gray-800 px-5 py-3 text-l font-semibold">Add New Widget</div>
        <div className=" flex flex-col gap-2 p-5 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div>
            <div className="text-sm mb-1">Widget Name</div>
            <input onChange={(e) => updateValue({ key: Fields.NAME, _value: e.target.value })} className="input-primary" type="text" placeholder="eg. Bitcoin Price Tracker" />
          </div>
          <div>
            <div className="text-sm mb-1">API URL</div>
            <div className="flex gap-2">
              <input onChange={(e) => updateValue({ key: Fields.URL, _value: e.target.value })} className="input-primary" type="text" placeholder="eg. https://api.coinbase.com/v2/exchange-rates?currency=BTC" />
              <button onClick={handleTest} className={value[Fields.URL] ? "button-primary" : "button-secondary"} style={{ height: "auto", padding: "0 10px" }} disabled={!value[Fields.URL]}><ArrowRepeat size={20} />Test</button>
            </div>
            {data && <div className="text-xs text-green-500 flex items-center gap-1 mt-1"> <Eye size={15} />API connection successful! 1 top-level fields found.</div>}
          </div>
          <div>
            <div className="text-sm mb-1">Refresh Interval (seconds)</div>
            <input onChange={(e) => updateValue({ key: Fields.REFRESH_INTERVAL, _value: Number(e.target.value) })} className="input-primary" type="number" placeholder="eg. 30" />
          </div>
          {data && <FieldsForm data={data} selectedFields={value[Fields.FIELDS]} onFormChange={updateValue} />}
        </div>
        <div className="flex justify-end border-t border-gray-800 px-5 py-3">
          <button className="mr-2">Cancel</button>
          <button className="button-primary">Add Widget</button>
        </div>
      </div>
    </div>
  );
}; 
