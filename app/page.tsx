"use client";

import { useState, useEffect } from "react";

import { Navbar } from "./components/Navbar";
import { WidgetForm } from "./components/widgetForm";
import { Widgets } from "./components/widgets";

import { useWidgets } from "./hooks/useWidgets";

const Home = () => {

  const {
    showForm,
    widgetsData,
    editingWidget,
    handleAddWidget,
    handleEditWidget,
    handleDeleteWidget,
    handleSaveWidget,
    handleCloseWidget,
    handleReorder
  } = useWidgets();

  return (
    <div>
      <Navbar onAddWidget={handleAddWidget} activeWidgets={widgetsData.length} />
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
