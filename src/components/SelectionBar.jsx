// src/components/SelectionBar.jsx
import React from 'react';
import { useAppContext } from '../hooks/useAppContext'; // Ensure path is correct

const SelectionBar = () => {
  // Get state, provide defaults. Note: clearCurrentActions is no longer needed here.
  const contextValue = useAppContext();
  const {
      currentActions = [],
      removeCurrentAction = () => {},
      // clearCurrentActions // Removed as the button is gone
  } = contextValue || {};

  // Render Null if No Actions (Keep as is)
  if (!currentActions || currentActions.length === 0) {
    return null;
  }

  // Event Handler for removing single action (Keep as is)
  const handleRemoveAction = (actionToRemove) => {
    removeCurrentAction(actionToRemove);
  };

  // --- Render Component ---
  return (
    // --- Container: Reduced margin-bottom and padding ---
    <div className="mb-2 p-1 bg-white rounded shadow-sm border border-primary"> {/* Changed to mb-2 p-1 */}

      {/* --- REMOVED: Header div containing Title and Clear All button --- */}

      {/* --- List Group: Added list-group-flush to remove borders/rounding --- */}
      <ul className="list-group list-group-flush">
        {currentActions.map((action, index) => (
          <li
            key={action.id || index} // Use unique ID if available
            // --- List Item: Reduced padding, keep flex layout ---
            className={`list-group-item d-flex justify-content-between align-items-center py-1 px-2 ${ // Smaller padding: py-1 px-2
              index % 2 === 0 ? 'bg-light' : '' // Keep alternating color
            }`}
          >
            {/* --- Action Description: Smaller font size, reduced margin --- */}
            <span
              className="text-wrap me-1" // Reduced margin-end to me-1
              // Apply significantly smaller font size using inline style
              // 0.7rem is ~70% of standard 1rem, 0.6rem is 60% etc. Adjust as needed.
              style={{ fontSize: '0.95rem', lineHeight: '1.3' }} // Added line-height for tight spacing
            >
              {action.description}
            </span>

            {/* --- Remove Button: Keep small version --- */}
            <button
              type="button"
              className="btn-close btn-sm" // Keep btn-sm for small 'X'
              aria-label="Remove Action"
              onClick={() => handleRemoveAction(action)}
              title={`Remove action: ${action.description}`}
              // Optional: Adjust size further if needed, though btn-close btn-sm is quite small
              // style={{ fontSize: '0.5em', padding: '0.1em' }}
            ></button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SelectionBar;