// src/components/DemandTitleList.jsx
import React from 'react';
import { useAppContext } from '../hooks/useAppContext';

const DemandTitleList = () => {
  // Get necessary state and functions from context
  const { selectedCustomer, selectedTitle, selectTitle } = useAppContext();

  // Early exit if no customer or no titles available
  if (!selectedCustomer?.demand_titles || selectedCustomer.demand_titles.length === 0) {
    return null; // Don't render anything if there are no titles
  }

  return (
    // Main container for the title list section
    <div className="mb-3 pb-2 border-bottom">
        <h6>Demand Titles</h6>
        {/* Container for the buttons */}
        {/*
          - Replace flex-row with flex-wrap to allow wrapping
          - Remove inline style that forced no-wrap and horizontal scroll
        */}
        <div className="d-flex flex-wrap gap-2"> {/* Changed from flex-row, removed inline style */}
             {selectedCustomer.demand_titles.map((title) => (
                <button
                    // Assuming title.title is unique enough for a key within this customer
                    key={title.title}
                    type="button"
                    // Highlight button if it's the currently selected title
                    className={`btn btn-sm ${selectedTitle?.title === title.title ? 'btn-success' : 'btn-outline-secondary'}`}
                    // Call selectTitle function when a button is clicked
                    onClick={() => selectTitle(title)}
                 >
                   {title.title}
                 </button>
             ))}
        </div>
    </div>
  );
};

export default DemandTitleList;