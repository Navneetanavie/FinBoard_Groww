"use client";

import { useState } from "react";
import { Navbar } from "./components/Navbar";
import { WidgetForm } from "./components/WidgetForm";
import { Widgets } from "./components/widgets";

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
      <Widgets handleAddWidget={handleAddWidget} />
      {showForm ? <WidgetForm onClose={handleCloseWidget} /> : null}
    </div>
  );
};

export default Home;
