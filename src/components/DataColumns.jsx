// src/components/DataColumns.jsx
import React, { useRef, useEffect } from "react";
import { useAppContext } from "../hooks/useAppContext";
import DemandTitleList from "./DemandTitleList"; // Import DemandTitleList here
import renderTextWithLineBreaks from "../utils/utils";

// --- Main DataColumns Component ---
const DataColumns = () => {
  const {
    selectedCustomer, // Need customer to pass to DemandTitleList implicitly via context
    selectedTitle,
    selectedPatientType, // Need this for highlighting comparison
    selectPatientType, // Function called on click
    scrollToTarget, // <<<--- 1. Get the target from context
    setScrollToTarget, // <<<--- 2. Get the setter to reset the signal
  } = useAppContext();
  // 3. Create refs to hold references to the DOM elements
  const scrollContainerRef = useRef(null); // Ref for the main scrollable div
  const demandRefs = useRef(new Map());
  const patientTypeRefs = useRef(new Map());

  // 4. Create an effect that triggers the scroll
  useEffect(() => {
    if (!scrollToTarget) return; // Do nothing if there's no target

    let targetNode = null;

    if (scrollToTarget.type === "demand" && scrollToTarget.payload) {
      // Find the demand group div in our ref map
      targetNode = demandRefs.current.get(scrollToTarget.payload.name);
    } else if (
      scrollToTarget.type === "patientType" &&
      scrollToTarget.payload
    ) {
      // Find the patient type div in our ref map
      targetNode = patientTypeRefs.current.get(scrollToTarget.payload.name);
    }

    if (targetNode) {
      console.log(
        `Scrolling to ${scrollToTarget.type}:`,
        scrollToTarget.payload.name
      );
      // Use the modern scrollIntoView API
      targetNode.scrollIntoView({
        behavior: "smooth", // Use smooth scrolling
        block: "center", // Center the element in the viewport vertically
      });

      // Optional: Add a temporary highlight effect
      targetNode.style.transition = "background-color 0.2s ease";
      targetNode.style.backgroundColor = "#d1ecf1"; // A light blue highlight
      setTimeout(() => {
        targetNode.style.backgroundColor = ""; // Reset background color
      }, 1500); // Highlight for 1.5 seconds
    }

    // 5. Reset the scroll target signal in the context so it doesn't scroll again on re-renders
    setScrollToTarget(null);
  }, [scrollToTarget, setScrollToTarget]); // This effect runs only when scrollToTarget changes

  // Early exit if no customer selected (should be handled by parent page)
  if (!selectedCustomer) {
    return null;
  }

  // Get demands based on the selected title from context
  const demandsToShow = selectedTitle?.demands || [];

  return (
    // Main scrollable container for this section
    <div
      style={{
        // Define height and enable scrolling for the content area below the sticky header
        // Adjust '18rem' based on actual height of elements above (Navbar, CustomerSelector, SelectionBar)
        position: "relative", // Establishes containing block for sticky header inside
        display: "flex",
        flexDirection: "column",
        flex: 1,
        overflow: "hidden",
        height: "100%",
      }}
    >
      {/* --- Sticky Header Section --- */}
      {/* This div sticks to the top of the scrollable container above */}
      <div
        style={{
          position: "sticky",
          top: 0, // Stick to the top of the scrollable parent
          zIndex: 999, // Keep header above scrolling content within this container
        }}
      >
        {/* 1. Render the Demand Title List */}
        <div className="p-1">
          <DemandTitleList /> {/* Rendered ONCE here */}
        </div>
      </div>
      {/* --- End Sticky Header Section --- */}

      {/* --- Scrollable Data Content --- */}
      {/* This div contains the actual data rows that will scroll */}
      <div
        ref={scrollContainerRef}
        className="py-1"
        style={{
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
          flex: 1,
          backgroundColor: "#f8f9fa",
        }}
      >
        {/* Show placeholder if customer selected but no title selected */}
        {!selectedTitle ? (
          <div className="p-3 text-center text-muted">
            <p>Select a Demand Title above to view details.</p>
          </div>
        ) : /* Show message if title selected but no demands */
        demandsToShow.length === 0 ? (
          <p className="text-muted p-3">No demands found for this title.</p>
        ) : (
          /* Map over Demands and render the Flexbox layout */
          demandsToShow.map((demand, demandIndex) => {
            const patientTypes = demand.patient_types || [];
            const demandGroupKey = demand.name
              ? `demand-group-${demand.name}-${demandIndex}`
              : `demand-group-${demandIndex}`;
            return (
              // Flex container for the Demand Group
              <div
                key={demandGroupKey}
                ref={(el) =>
                  el
                    ? demandRefs.current.set(demand.name, el)
                    : demandRefs.current.delete(demand.name)
                }
                className={`d-flex border ${
                  demandIndex > 0 ? "border-top-2 border-secondary" : ""
                } mb-2 rounded shadow-sm`} // Separator style
                style={{ backgroundColor: "#f8f9fa" }} // Group background
              >
                {/* Left Side: Demand Name */}
                <div
                  className="p-2 border-end" // Padding and separator
                  style={{
                    flexBasis: "40%",
                    flexShrink: 0,
                    alignSelf: "stretch",
                    display: "flex",
                    alignItems: "center",
                    fontWeight: "500",
                  }}
                >
                  <small style={{ fontSize: "0.79rem" }}>
                    {renderTextWithLineBreaks(demand.name)}
                  </small>
                </div>

                {/* Right Side: List of Patient Types */}
                <div
                  className="p-0" // Padding
                  style={{
                    flexGrow: 1,
                    flexBasis: "60%",
                    backgroundColor: "white",
                  }} // Fill space, white background
                >
                  {patientTypes.length > 0 ? (
                    // Render list if patient types exist
                    <div>
                      {patientTypes.map((patientType, typeIndex) => {
                        // Compare the object reference directly, not just the name
                        const isSelectedType =
                          selectedPatientType === patientType;

                        const typeKey = patientType.name
                          ? `pt-${patientType.name}-${typeIndex}`
                          : `pt-${typeIndex}`;
                        return (
                          // Div for each clickable patient type
                          <div
                            key={typeKey}
                            ref={(el) =>
                              el
                                ? patientTypeRefs.current.set(
                                    patientType.name,
                                    el
                                  )
                                : patientTypeRefs.current.delete(
                                    patientType.name
                                  )
                            }
                            className={`patient-type-item p-1 ${
                              patientTypes.length > 1 &&
                              typeIndex < patientTypes.length - 1
                                ? "border-bottom"
                                : ""
                            } ${
                              isSelectedType ? "bg-info-subtle rounded-1" : ""
                            }`} // Highlight if selected
                            style={{
                              cursor: "pointer",
                              fontSize: "0.79rem",
                              transition: "background-color 0.2s ease",
                            }}
                            onClick={() => selectPatientType(patientType)} // Select and add actions
                            onMouseEnter={(e) =>
                              !isSelectedType &&
                              (e.currentTarget.style.backgroundColor =
                                "#eef2f7")
                            } // Hover effect
                            onMouseLeave={(e) =>
                              !isSelectedType &&
                              (e.currentTarget.style.backgroundColor =
                                "transparent")
                            }
                            title={`Click to add actions for ${patientType.name}`}
                          >
                            {renderTextWithLineBreaks(patientType.name)}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    // Placeholder if no patient types for this demand
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
          }) // End demands map
        )}
      </div>
      {/* --- End Scrollable Data Content --- */}
    </div> // End data-columns-container (scrollable)
  );
};

export default DataColumns;
