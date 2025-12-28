"use client";

import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { WidgetForm } from "./components/WidgetForm";
import { Widgets } from "./components/widgets";
import type { WidgetFormState } from "./types";

const Home = () => {

  const [showForm, setShowForm] = useState(false);
  const [widgetsData, setWidgetsData] = useState<WidgetFormState[]>([]);
  const [editingWidget, setEditingWidget] = useState<WidgetFormState | undefined>(undefined);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("widgets") || "[]") as WidgetFormState[];
    setWidgetsData(data);
    setMounted(true);
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
    let newData;
    if (editingWidget) {
      // Update existing
      newData = widgetsData.map(w => (w.id || w.name) === (widget.id || widget.name) ? widget : w);
    } else {
      // Add new
      newData = [...widgetsData, widget];
    }
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

  if (!mounted) return null;

  return (
    <div>
      <Navbar onAddWidget={handleAddWidget} />
      <Widgets
        widgets={widgetsData}
        onReorder={handleReorder}
        onAddWidget={handleAddWidget}
        onEditWidget={handleEditWidget}
        onDeleteWidget={handleDeleteWidget}
      />
      {showForm ? (
        <WidgetForm
          onClose={handleCloseWidget}
          onSave={handleSaveWidget}
          initialValues={editingWidget}
        />
      ) : null}
    </div>
  );
};

export default Home;
