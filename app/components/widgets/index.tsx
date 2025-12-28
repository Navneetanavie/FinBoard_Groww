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

interface WidgetsProps {
  widgets: WidgetFormState[];
  onReorder: (widgets: WidgetFormState[]) => void;
  onAddWidget: () => void;
  onDeleteWidget: (id: string) => void;
  onEditWidget: (widget: WidgetFormState) => void;
}

export const Widgets = ({ widgets, onReorder, onAddWidget, onDeleteWidget, onEditWidget }: WidgetsProps) => {

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
      const oldIndex = widgets.findIndex((item) => (item.id || item[Fields.NAME]) === active.id);
      const newIndex = widgets.findIndex((item) => (item.id || item[Fields.NAME]) === over?.id);

      const newItems = arrayMove(widgets, oldIndex, newIndex);
      onReorder(newItems);
    }
  };

  return (
    <div className="p-4 h-full overflow-y-auto">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={widgets.map(w => w.id || w[Fields.NAME])}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-20">
            {widgets.map((widget) => {
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
                        const commonProps = {
                          widgetData: widget,
                          onDelete: () => onDeleteWidget(widget.id || widget.name),
                          onEdit: () => onEditWidget(widget),
                        };

                        switch (widget[Fields.DISPLAY_MODE]) {
                          case "table":
                            return <TableWidget {...commonProps} />;
                          case "chart":
                            return <ChartWidget {...commonProps} />;
                          case "card":
                            return <CardWidget {...commonProps} />;
                          default:
                            return null;
                        }
                      })()}
                    </div>
                  </SortableWidget>
                </div>
              );
            })}
            <AddWidget onAddWidget={onAddWidget} />
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
} 