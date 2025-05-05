// src/components/SelectionBar.jsx
import React from 'react';
import { useAppContext } from '../hooks/useAppContext';

const SelectionBar = () => {
  const { selectedActions, removeAction, clearActions } = useAppContext();

  // Don't render the component if no actions are selected
  if (selectedActions.length === 0) {
    return null;
  }

  return (
    // Container for the selection bar
    <div className="mb-4 p-3 bg-white rounded shadow-sm border border-primary">
      {/* Header with title and Clear All button */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6 className="mb-0">Selected Actions</h6>
        <button
          className="btn btn-sm btn-outline-danger d-flex align-items-center"
          onClick={clearActions}
          title="Clear All Actions"
        >
          {/* SVG icon for 'X' */}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-lg me-1" viewBox="0 0 16 16">
             <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
          </svg>
          Clear All
        </button>
      </div>

      {/* Replace the flex container with a UL for a vertical list */}
      {/* 'list-unstyled' removes default bullet points and padding */}
      <ul className="list-unstyled mb-0"> {/* mb-0 to remove default bottom margin of ul */}
        {selectedActions.map((action, index) => (
          // Each action is now a list item
          <li key={index} className="mb-1"> {/* Add margin-bottom for spacing between items */}
            {/* Badge containing the action text and remove button */}
            {/* Using d-flex on the span to align text and button nicely */}
            <span
               className="badge text-bg-info p-2 text-wrap d-flex justify-content-between align-items-center w-100" // Use w-100 to make badge take full width
               style={{ textAlign: 'left' }} // Ensure text aligns left
             >
              {/* Action description */}
              <span>{action.description}</span>

              {/* Remove button for individual action */}
              <button
                type="button"
                className="btn-close btn-close-white ms-2" // Keep margin-start for spacing
                aria-label="Remove Action"
                onClick={() => removeAction(action)}
                style={{ fontSize: '0.6em', padding: '0.2em' }} // Keep small 'X'
              ></button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SelectionBar;