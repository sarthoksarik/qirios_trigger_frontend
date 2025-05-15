// src/pages/HomePage.jsx (Make sure ProfilePage.jsx is similar)
import React from "react";
import { useAppContext } from "../hooks/useAppContext";
// NO import for DemandTitleList here
import DataColumns from "../components/DataColumns"; // DataColumns handles everything now

const HomePage = () => {
  const { selectedCustomer, loading, error } = useAppContext();

  return (
    // This container usually comes from the <Outlet/> in Layout.jsx
    <>
      {/* Loading/Error messages */}
      {loading && !selectedCustomer && <p>Loading data...</p>}
      {error && <p className="text-danger">{error}</p>}

      {/* Placeholder when no customer is selected */}
      {!selectedCustomer && !loading && !error && (
        <div className="p-3 bg-light rounded shadow-sm text-center">
          <h5>Welcome!</h5>
          <a
            href="https://www.flaticon.com/free-animated-icons/surgery"
            title="surgery animated icons"
          >
            Surgery animated icons created by Freepik - Flaticon
          </a>
          <p>Please select a customer using the dropdown or grid above.</p>
        </div>
      )}

      {/* Render DataColumns ONLY when a customer is selected */}
      {/* NO <DemandTitleList /> component rendered here anymore */}
      {selectedCustomer && !loading && !error && <DataColumns />}
    </>
  );
};

export default HomePage;
