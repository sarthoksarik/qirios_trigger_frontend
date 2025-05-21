// src/components/DataColumns.jsx
import React from "react";
import { useAppContext } from "../hooks/useAppContext";
import DemandTitleList from "./DemandTitleList";
import GlobalSearch from "./GlobalSearch"; // <<<--- 1. Import GlobalSearch

// --- Main DataColumns Component ---
const DataColumns = () => {
  const {
    selectedCustomer,
    selectedTitle,
    selectedPatientType,
    selectPatientType,
  } = useAppContext();

  if (!selectedCustomer) {
    return null; // Or some placeholder if DataColumns can be rendered without a customer
  }

  const demandsToShow = selectedTitle?.demands || [];

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        overflow: "hidden",
        height: "100%",
      }}
    >
      {/* --- Sticky Header Section --- */}
      <div
        style={{
          position: "sticky",
          top: 0,
          backgroundColor: "#f8f9fa", // Match the scrollable area or choose a header bg
          zIndex: 10, // Ensure sticky header is above scrolling content within this container
        }}
      >
        {/* --- 2. Place GlobalSearch component here ---  */}
        <div
          style={{
            padding: "10px", // Adjusted padding slightly
            borderBottom: "1px solid #eee",
            // marginBottom: "20px", // Margin might not be needed if DemandTitleList follows directly
          }}
        >
          <GlobalSearch />
        </div>

        {/* 1. Render the Demand Title List */}
        <div className="p-1">
          <DemandTitleList />
        </div>

        {/* Optional Data Header Row - (your existing commented out code) */}
      </div>
      {/* --- End Sticky Header Section --- */}

      {/* --- Scrollable Data Content --- */}
      <div
        className="py-1"
        style={{
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
          flex: 1,
          backgroundColor: "#f8f9fa",
        }}
      >
        {/* ... (rest of your existing scrollable content logic for demands and patient types) ... */}
        {!selectedTitle ? (
          <div className="p-3 text-center text-muted">
            <p>Select a Demand Title above to view details.</p>
          </div>
        ) : demandsToShow.length === 0 ? (
          <p className="text-muted p-3">No demands found for this title.</p>
        ) : (
          demandsToShow.map((demand, demandIndex) => {
            // ... your mapping logic ...
            const patientTypes = demand.patient_types || [];
            const demandGroupKey = demand.name
              ? `demand-group-${demand.name}-${demandIndex}`
              : `demand-group-${demandIndex}`;
            return (
              <div
                key={demandGroupKey}
                className={`d-flex border ${
                  demandIndex > 0 ? "border-top-2 border-secondary" : ""
                } mb-2 rounded shadow-sm`}
                style={{ backgroundColor: "#f8f9fa" }}
              >
                <div
                  className="p-2 border-end"
                  style={{
                    flexBasis: "40%",
                    flexShrink: 0,
                    alignSelf: "stretch",
                    display: "flex",
                    alignItems: "center",
                    fontWeight: "500",
                  }}
                >
                  <small style={{ fontSize: "0.79rem" }}>{demand.name}</small>
                </div>
                <div
                  className="p-0"
                  style={{
                    flexGrow: 1,
                    flexBasis: "60%",
                    backgroundColor: "white",
                  }}
                >
                  {patientTypes.length > 0 ? (
                    <div>
                      {patientTypes.map((patientType, typeIndex) => {
                        const isSelectedType =
                          selectedPatientType === patientType;
                        const typeKey = patientType.name
                          ? `pt-${patientType.name}-${typeIndex}`
                          : `pt-${typeIndex}`;
                        return (
                          <div
                            key={typeKey}
                            className={`patient-type-item p-1 ${
                              patientTypes.length > 1 &&
                              typeIndex < patientTypes.length - 1
                                ? "border-bottom"
                                : ""
                            } ${
                              isSelectedType ? "bg-info-subtle rounded-1" : ""
                            }`}
                            style={{
                              cursor: "pointer",
                              fontSize: "0.79rem",
                              transition: "background-color 0.2s ease",
                            }}
                            onClick={() => selectPatientType(patientType)}
                            onMouseEnter={(e) =>
                              !isSelectedType &&
                              (e.currentTarget.style.backgroundColor =
                                "#eef2f7")
                            }
                            onMouseLeave={(e) =>
                              !isSelectedType &&
                              (e.currentTarget.style.backgroundColor =
                                "transparent")
                            }
                            title={`Click to add actions for ${patientType.name}`}
                          >
                            {patientType.name}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div
                      className="p-1 text-muted"
                      style={{ fontSize: "0.85rem" }}
                    >
                      N/A
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DataColumns;
