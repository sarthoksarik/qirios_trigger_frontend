// src/components/DataColumns.jsx
import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import DemandTitleList from './DemandTitleList'; // Import DemandTitleList here

// --- Main DataColumns Component ---
const DataColumns = () => {
    const {
        selectedCustomer, // Need customer to pass to DemandTitleList implicitly via context
        selectedTitle,
        selectedPatientType, // Need this for highlighting comparison
        selectPatientType,  // Function called on click
    } = useAppContext();

    // Early exit if no customer selected (should be handled by parent page)
    if (!selectedCustomer) {
        return null;
    }

    // Get demands based on the selected title from context
    const demandsToShow = selectedTitle?.demands || [];

    return (
        // Main scrollable container for this section
        <div
            className="data-columns-container border rounded shadow-sm"
            style={{
                // Define height and enable scrolling for the content area below the sticky header
                // Adjust '18rem' based on actual height of elements above (Navbar, CustomerSelector, SelectionBar)
                maxHeight: 'calc(100vh - 18rem)', // Or '65vh', '70vh' etc.
                overflowY: 'auto', // Make this container scrollable
                position: 'relative' // Establishes containing block for sticky header inside
            }}
        >
            {/* --- Sticky Header Section --- */}
            {/* This div sticks to the top of the scrollable container above */}
            <div
                className="sticky-header bg-body border-bottom" // Use theme background color
                style={{
                    position: 'sticky',
                    top: 0,            // Stick to the top of the scrollable parent
                    zIndex: 1          // Keep header above scrolling content within this container
                }}
            >
                {/* 1. Render the Demand Title List */}
                <div className="p-2">
                    <DemandTitleList /> {/* Rendered ONCE here */}
                </div>

                {/* 2. Optional Data Header Row */}
                {/* Show header only if a title is selected */}
                 {selectedTitle && (
                    <div className="d-none d-md-flex row gx-2 px-2 pb-1 fw-bold text-secondary border-top bg-light">
                        <div className="col-5" style={{fontSize: '0.9rem'}}>Demand</div>
                        <div className="col-7" style={{fontSize: '0.9rem'}}>Patient Type (Click to Add Actions)</div>
                    </div>
                 )}
            </div>
            {/* --- End Sticky Header Section --- */}


            {/* --- Scrollable Data Content --- */}
            {/* This div contains the actual data rows that will scroll */}
            <div className="data-scroll-content px-1 py-2">
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
                        const demandGroupKey = demand.name ? `demand-group-${demand.name}-${demandIndex}` : `demand-group-${demandIndex}`;
                        return (
                            // Flex container for the Demand Group
                            <div
                                key={demandGroupKey}
                                className={`d-flex border ${demandIndex > 0 ? 'border-top-2 border-secondary' : ''} mb-2 rounded shadow-sm`} // Separator style
                                style={{ backgroundColor: '#f8f9fa' }} // Group background
                            >
                                {/* Left Side: Demand Name */}
                                <div
                                    className="p-2 border-end" // Padding and separator
                                    style={{
                                        flexBasis: '40%', flexShrink: 0, alignSelf: 'stretch',
                                        display: 'flex', alignItems: 'center', fontWeight: '500'
                                    }}
                                >
                                    <small style={{ fontSize: '0.79rem' }}>{demand.name}</small>
                                </div>

                                {/* Right Side: List of Patient Types */}
                                <div
                                    className="p-0" // Padding
                                    style={{ flexGrow: 1, flexBasis: '60%', backgroundColor: 'white' }} // Fill space, white background
                                >
                                    {patientTypes.length > 0 ? (
                                        // Render list if patient types exist
                                        <div>
                                            {patientTypes.map((patientType, typeIndex) => {
                                                // *** THIS IS THE CORRECTED LINE ***
                                                // Compare the object reference directly, not just the name
                                                const isSelectedType = selectedPatientType === patientType;
                                                // *** END CORRECTION ***

                                                const typeKey = patientType.name ? `pt-${patientType.name}-${typeIndex}` : `pt-${typeIndex}`;
                                                return (
                                                    // Div for each clickable patient type
                                                    <div
                                                        key={typeKey}
                                                        className={`patient-type-item p-1 ${patientTypes.length > 1 && typeIndex < patientTypes.length - 1 ? 'border-bottom' : ''} ${isSelectedType ? 'bg-info-subtle rounded-1' : ''}`} // Highlight if selected
                                                        style={{ cursor: 'pointer', fontSize: '0.79rem', transition: 'background-color 0.2s ease'}}
                                                        onClick={() => selectPatientType(patientType)} // Select and add actions
                                                        onMouseEnter={(e) => !isSelectedType && (e.currentTarget.style.backgroundColor = '#eef2f7')} // Hover effect
                                                        onMouseLeave={(e) => !isSelectedType && (e.currentTarget.style.backgroundColor = 'transparent')}
                                                        title={`Click to add actions for ${patientType.name}`}
                                                    >
                                                        {patientType.name}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        // Placeholder if no patient types for this demand
                                        <div className="p-1 text-muted" style={{ fontSize: '0.85rem' }}>N/A</div>
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