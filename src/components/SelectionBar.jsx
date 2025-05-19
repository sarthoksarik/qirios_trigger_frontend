// src/components/SelectionBar.jsx
import React from "react";
import { useAppContext } from "../hooks/useAppContext"; // Ensure path is correct

const SelectionBar = () => {
  const contextValue = useAppContext();
  const { currentActions = [], removeCurrentAction = () => {} } =
    contextValue || {};

  if (!currentActions || currentActions.length === 0) {
    return null;
  }

  const handleRemoveAction = (actionToRemove) => {
    removeCurrentAction(actionToRemove);
  };

  // Helper function to render text with <br /> tags for actual line breaks
  const renderTextWithLineBreaks = (text) => {
    if (!text && text !== 0) return null; // Allow '0' to be displayed if it's a valid text
    // Ensure text is a string before calling split
    const parts = String(text).split(/<br\s*\/?>|\n/);
    return parts.map((part, idx) => (
      <React.Fragment key={idx}>
        {part}
        {/* Only add <br /> if it's not the last part */}
        {idx < parts.length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className="mb-2 p-1 bg-white rounded shadow-sm border border-primary">
      <ul className="list-group list-group-flush">
        {currentActions.map((action, index) => (
          <li
            key={action.id || action.description || index} // Fallback key
            // align-items-start to align items at the top if their heights differ
            className={`list-group-item d-flex justify-content-between align-items-start py-1 px-2 ${
              index % 2 === 0 ? "bg-light" : ""
            }`}
          >
            {/* Wrapper for text content to allow it to grow */}
            <div className="text-wrap me-2 flex-grow-1">
              {" "}
              {/* me-2 for spacing before button, flex-grow-1 */}
              {/* Action Description */}
              {action.description !== undefined &&
                action.description !== null && ( // Check if description exists
                  <span
                    // display: 'block' ensures it takes its own line
                    style={{
                      fontSize: "0.95rem",
                      lineHeight: "1.3",
                      display: "block",
                    }}
                  >
                    {renderTextWithLineBreaks(action.description)}
                  </span>
                )}
              {/* Dire Text - Display if it exists, on a new line due to d-block */}
              {action.dire_text !== undefined &&
                action.dire_text !== null &&
                String(action.dire_text).trim() !== "" && (
                  <span
                    className="d-block" // d-block for new line, text-muted for style
                    style={{
                      fontSize: "0.90rem", // Slightly smaller or different style
                      lineHeight: "1.2",
                      color: "blue",
                      textAlign: "center",
                      // Add margin if description is also present to ensure separation
                      marginTop:
                        action.description !== undefined &&
                        action.description !== null
                          ? "0.25rem"
                          : "0",
                    }}
                  >
                    {<hr></hr>}
                    {renderTextWithLineBreaks(action.dire_text)}
                  </span>
                )}
            </div>

            {/* Remove Button - Ensure it doesn't shrink and has margin */}
            <button
              type="button"
              className="btn-close btn-sm ms-1 flex-shrink-0" // ms-1 for a little space, flex-shrink-0
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
