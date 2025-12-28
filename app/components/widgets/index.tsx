import { useEffect, useState } from "react";

import { CardWidget } from "./CardWidget";
import { ChartWidget } from "./ChartWidget";
import { TableWidget } from "./TableWidget";
import { AddWidget } from "./AddWidget";

import type { WidgetFormState } from "../../types";
import { Fields } from "../../constants";

export const Widgets = ({ handleAddWidget }: { handleAddWidget: () => void }) => {
  const [widgetsData, setWidgetsData] = useState<WidgetFormState[]>([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("widgets") || "[]") as WidgetFormState[];
    setWidgetsData(data);
  }, []);

  return (
    <div className="p-10 h-full">
      {widgetsData.map((widget: WidgetFormState) => {
        switch (widget[Fields.DISPLAY_MODE]) {
          case "table":
            return <TableWidget key={widget.id} widgetData={widget} />;
          case "chart":
            return <ChartWidget key={widget.id} widgetData={widget} />;
          case "card":
            return <CardWidget key={widget.id} widgetData={widget} />;
          default:
            return null;
        }
      })}
      <AddWidget onAddWidget={handleAddWidget} />
    </div>
  )
}