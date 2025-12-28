import { useState, useEffect } from "react";

import type { WidgetEntity } from "../types";

export const useWidgets = () => {
  const [showForm, setShowForm] = useState(false);
  const [widgetsData, setWidgetsData] = useState<WidgetEntity[]>([]);
  const [editingWidget, setEditingWidget] = useState<WidgetEntity | undefined>(undefined);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("widgets") || "[]") as WidgetEntity[];
    setWidgetsData(data);
  }, []);

  const saveToLocalStorage = (data: WidgetEntity[]) => {
    localStorage.setItem("widgets", JSON.stringify(data));
    setWidgetsData(data);
  };

  const handleAddWidget = () => {
    setEditingWidget(undefined);
    setShowForm(true);
  };

  const handleEditWidget = (widget: WidgetEntity) => {
    setEditingWidget(widget);
    setShowForm(true);
  };

  const handleDeleteWidget = (id: string) => {
    const newData = widgetsData.filter(w => (w.id || w.name) !== id);
    saveToLocalStorage(newData);
  };

  const handleSaveWidget = (widget: WidgetEntity) => {
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

  const handleReorder = (newWidgets: WidgetEntity[]) => {
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
