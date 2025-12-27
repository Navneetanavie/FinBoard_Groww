"use client";

import { useState } from "react";
import { Navbar } from "./components/Navbar";
import { AddWidget } from "./components/AddWidget";
import { WidgetForm } from "./components/WidgetForm";

const Home = () => {

  const [showForm, setShowForm] = useState(false);

  const handleAddWidget = () => {
    setShowForm(true);
  };

  const handleCloseWidget = () => {
    setShowForm(false);
  }
  return (
    <div>
      <Navbar onAddWidget={handleAddWidget} />
      <div className="p-10 h-full">
        <AddWidget onAddWidget={handleAddWidget} />
      </div>
      {showForm ? <WidgetForm onClose={handleCloseWidget}/> : null}
    </div>
  );
};

export default Home;
