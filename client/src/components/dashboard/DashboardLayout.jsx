// DashboardLayout.js
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { motion } from "framer-motion";
import { FaBars } from "react-icons/fa";
import Header from "./Header"; // Add the Header component
import { Route, Routes } from "react-router-dom";
import DashboardOverview from "./Dashboard";
import CreateInventory from "../../pages/Inventory/CreateInventory";
import InventoryManagement from "./dasboard/InventoryManagement";
import FeedbackManager from "./dasboard/FeedbackManager";
import AppointmentManager from "./dasboard/AppointmentManager";
import Service_and_PackageManager from "./dasboard/Service_and_PackageManager";
import EditAppointment from "../../pages/appointment/EditAppointment";
import EditService from "../../pages/Service_and_packages/EditService";

const contentVariants = {
  open: { marginLeft: 250, transition: { type: "spring", stiffness: 50 } },
  closed: { marginLeft: 0, transition: { type: "spring", stiffness: 50 } },
};

export default function DashboardLayout() {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <div className="relative min-h-screen bg-PrimaryColor">
      {/* Toggle Button */}

      {/* Sidebar Component */}
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <motion.main
        className=" flex-1 ml-0 transition-all"
        variants={contentVariants}
        animate={isOpen ? "open" : "closed"}
      >
        <Header />

        {/* Routes for Dashboard Components */}
        <Routes>
          <Route path="/" element={<DashboardOverview />} />
          {/* <Route path="/create" element={<CreateInventory />} /> */}
          <Route path="/inventory-management" element={<InventoryManagement />} />
          <Route path="/Feedback-management" element={<FeedbackManager />} />
          <Route path="/appointment-management" element={<AppointmentManager />} />
          <Route path="/Service-management" element={<Service_and_PackageManager />} />
          <Route path="/edit-appointment/:id" element={<EditAppointment />} />
          <Route path="/edit-service/:id" element={<EditService />} />
           </Routes>
      </motion.main>
    </div>
  );
}
