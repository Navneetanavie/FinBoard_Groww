import { useState, useEffect } from "react";

import type { WidgetFormState } from "../types";

export const useWidgets = () => {
  const [showForm, setShowForm] = useState(false);
  const [widgetsData, setWidgetsData] = useState<WidgetFormState[]>([]);
  const [editingWidget, setEditingWidget] = useState<WidgetFormState | undefined>(undefined);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("widgets") || "[]") as WidgetFormState[];
    setWidgetsData(data);
  }, []);

  const saveToLocalStorage = (data: WidgetFormState[]) => {
    localStorage.setItem("widgets", JSON.stringify(data));
    setWidgetsData(data);
  };

  const handleAddWidget = () => {
    setEditingWidget(undefined);
    setShowForm(true);
  };

  const handleEditWidget = (widget: WidgetFormState) => {
    setEditingWidget(widget);
    setShowForm(true);
  };

  const handleDeleteWidget = (id: string) => {
    const newData = widgetsData.filter(w => (w.id || w.name) !== id);
    saveToLocalStorage(newData);
  };

  const handleSaveWidget = (widget: WidgetFormState) => {
    const newData = editingWidget
      ? widgetsData.map(w => w.id === widget.id ? widget : w)
      : [...widgetsData, widget];
    saveToLocalStorage(newData);
    setShowForm(false);
    setEditingWidget(undefined);
  };

  const handleCloseWidget = () => {
    setShowForm(false);
    setEditingWidget(undefined);
  }

  const handleReorder = (newWidgets: WidgetFormState[]) => {
    saveToLocalStorage(newWidgets);
  }

  return {
    widgetsData,
    showForm,
    editingWidget,
    handleAddWidget,
    handleEditWidget,
    handleDeleteWidget,
    handleSaveWidget,
    handleCloseWidget,
    handleReorder
  };
};
