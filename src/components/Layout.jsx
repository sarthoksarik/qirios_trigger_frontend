// src/components/Layout.jsx
import React from "react"; // Removed unused useEffect import for now
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import CustomerSelector from "./CustomerSelector";
import SelectionBar from "./SelectionBar";
import { useAppContext } from "../hooks/useAppContext";

const Layout = () => {
  const {
    // --- CORRECTED: Use currentActions ---
    currentActions,
    updateError,
    //updateSuccessMessage
  } = useAppContext();

  return (
    <div
      style={{
        maxHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        flex: 1,
      }}
    >
      <Navbar />
      <div
        style={{
          position: "sticky",
          top: 40,
          zIndex: 1020,
          backgroundColor: "var(--bs-body-bg, white)", // Ensure background for sticky
          paddingBottom: "0.5rem", // Add padding if needed
        }}
      >
        <CustomerSelector />
        {/* --- CORRECTED: Check currentActions.length --- */}
        {/* Optional chaining ?. is even safer in case currentActions is briefly not an array */}
        {currentActions?.length > 0 && <SelectionBar />}
      </div>
      {/* Display Update Status Messages */}
      {updateError && (
        <div
          className="alert alert-danger alert-dismissible fade show mt-2"
          role="alert"
        >
          {updateError}
        </div>
      )}

      <Outlet />
    </div>
  );
};

export default Layout;
