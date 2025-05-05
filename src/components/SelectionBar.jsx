// src/components/SelectionBar.jsx
import React from 'react';
import { useAppContext } from '../hooks/useAppContext'; // Ensure path is correct

const SelectionBar = () => {
  // --- Get State & Defaults (Keep the safe destructuring) ---
  const contextValue = useAppContext();
  const {
      currentActions = [],
      removeCurrentAction = () => {},
      clearCurrentActions = () => {}
  } = contextValue || {};

  // --- Debugging Logs (Optional: You can remove these now if everything works) ---
  // console.log('SelectionBar contextValue:', contextValue);
  // console.log('SelectionBar currentActions (after default):', currentActions);

  // --- Render Null if No Actions ---
  if (!currentActions || currentActions.length === 0) {
    return null;
  }

  // --- Event Handlers ---
  const handleRemoveAction = (actionToRemove) => {
    removeCurrentAction(actionToRemove);
  };

  const handleClearAll = () => {
    clearCurrentActions();
  };

  // --- Render Component ---
  return (
    <div className="mb-4 p-3 bg-white rounded shadow-sm border border-primary">
      {/* Header (Unchanged) */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6 className="mb-0">Selected Actions</h6>
        {currentActions.length > 0 && (
          <button
            className="btn btn-sm btn-outline-danger d-flex align-items-center"
            onClick={handleClearAll}
            title="Clear All Actions"
          >
            {/* SVG icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-lg me-1" viewBox="0 0 16 16">
               <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
            </svg>
            Clear All
          </button>
        )}
      </div>

      {/* --- MODIFIED: Use Bootstrap List Group --- */}
      {/* Use <ul> with list-group class */}
      <ul className="list-group">
        {currentActions.map((action, index) => (
          // Each action is a list item
          // Apply alternating background using bg-light utility class on even rows (index 0, 2, 4...)
          <li
            key={action.id || index} // Use unique ID if available
            className={`list-group-item d-flex justify-content-between align-items-center ${
              index % 2 === 0 ? 'bg-light' : '' // Add bg-light to even items
            }`}
          >
            {/* Action Description */}
            {/* text-wrap ensures long descriptions wrap within the list item */}
            <span className="text-wrap me-2">{action.description}</span>

            {/* Remove Button */}
            <button
              type="button"
              className="btn-close btn-sm" // Use btn-close for 'X' appearance
              aria-label="Remove Action"
              onClick={() => handleRemoveAction(action)}
              title={`Remove action: ${action.description}`}
            ></button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SelectionBar;