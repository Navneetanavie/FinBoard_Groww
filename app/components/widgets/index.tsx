"use client";
import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy
} from "@dnd-kit/sortable";

import { SortableWidget } from "./SortableWidget";
import { CardWidget } from "./CardWidget";
import { ChartWidget } from "./ChartWidget";
import { TableWidget } from "./TableWidget";
import { AddWidget } from "./AddWidget";

import type { WidgetFormState } from "../../types";
import { Fields } from "../../constants";

export const Widgets = ({ handleAddWidget }: { handleAddWidget: () => void }) => {
  const [widgetsData, setWidgetsData] = useState<WidgetFormState[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("widgets") || "[]") as WidgetFormState[];
    setWidgetsData(data);
    setMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setWidgetsData((items) => {
        const oldIndex = items.findIndex((item) => (item.id || item[Fields.NAME]) === active.id);
        const newIndex = items.findIndex((item) => (item.id || item[Fields.NAME]) === over?.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        localStorage.setItem("widgets", JSON.stringify(newItems));
        return newItems;
      });
    }
  };

  return (
    <div className="p-4 h-full overflow-y-auto">
      {mounted && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={widgetsData.map(w => w.id || w[Fields.NAME])}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-20">
              {widgetsData.map((widget) => {
                const getColSpan = (type: string) => {
                  switch (type) {
                    case "chart":
                    case "table":
                      return "col-span-1 md:col-span-2 lg:col-span-2"; // Span 2 cols on large screens
                    case "card":
                    default:
                      return "col-span-1";
                  }
                };

                return (
                  <div key={widget.id || widget[Fields.NAME]} className={getColSpan(widget[Fields.DISPLAY_MODE])}>
                    <SortableWidget id={widget.id || widget[Fields.NAME]}>
                      <div className="h-full w-full">
                        {(() => {
                          switch (widget[Fields.DISPLAY_MODE]) {
                            case "table":
                              return <TableWidget widgetData={widget} />;
                            case "chart":
                              return <ChartWidget widgetData={widget} />;
                            case "card":
                              return <CardWidget widgetData={widget} />;
                            default:
                              return null;
                          }
                        })()}
                      </div>
                    </SortableWidget>
                  </div>
                );
              })}
              <AddWidget onAddWidget={handleAddWidget} />
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
} 