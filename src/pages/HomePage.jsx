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
          <h5>Bienvenue !</h5>
          <p>
            Veuillez sélectionner un praticien via le menu déroulant ou en
            cliquant sur un bouton ci-dessus.
          </p>
        </div>
      )}

      {/* Render DataColumns ONLY when a customer is selected */}
      {/* NO <DemandTitleList /> component rendered here anymore */}
      {selectedCustomer && !loading && !error && <DataColumns />}
    </>
  );
};

export default HomePage;
