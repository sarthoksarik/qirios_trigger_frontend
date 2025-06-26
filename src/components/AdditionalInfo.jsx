// src/components/SelectedCustomerDisplay.js
import React from "react";
import { useAppContext } from "../hooks/useAppContext"; // Adjust path if your hooks folder is elsewhere
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
const AdditionalInfo = () => {
  const { selectedCustomer } = useAppContext();

  // If no customer is selected, display a message or nothing
  if (!selectedCustomer) {
    return (
      <div style={styles.container}>
        <p>No customer selected.</p>
      </div>
    );
  }

  // Destructure properties from selectedCustomer for easier use.
  // Provide default fallbacks ('N/A' or an empty string) in case a property is missing.
  const {
    name = "N/A",
    address = "Not specified", // Example of different default
    note1 = "",
    note2 = "",
  } = selectedCustomer;

  return (
    <div style={styles.container}>
      {/* Second Row: Address, Note1, Note2 */}
      <div style={styles.rowTwoContainer}>
        <div
          style={{
            ...styles.rowTwoItem,
            textAlign: "left",
            paddingLeft: "4px",
          }}
        >
          {renderTextWithLineBreaks(address)}
        </div>
        <div style={{ ...styles.rowTwoItem, textAlign: "center" }}>
          {renderTextWithLineBreaks(note1) || ""}{" "}
          {/* Alternative way to show N/A if empty */}
        </div>
        <div
          style={{
            ...styles.rowTwoItem,
            textAlign: "right",
            paddingRight: "4px",
          }}
        >
          {renderTextWithLineBreaks(name)}{" "}
          {/* Alternative way to show N/A if empty */}
        </div>
      </div>
      {/* First Row: Customer Name */}
      <div style={styles.rowOne}>{renderTextWithLineBreaks(note2) || ""}</div>
    </div>
  );
};

// Styles for the component
const styles = {
  container: {
    fontSize: "0.65rem",
    border: "1px solid #e0e0e0",
    borderRadius: "3px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)", // Subtle shadow
  },
  rowOne: {
    fontSize: "0.75rem",
    textAlign: "center", // Separator line
    color: "#16a53c",
  },
  rowTwoContainer: {
    display: "flex", // Key: Enables Flexbox for layout
    justifyContent: "space-between", // Distributes space between items (can also use 'space-around')
    gap: "1px", // Adds space between the flex items
  },
  rowTwoItem: {
    flex: 1, // Key: Makes each item take up equal available width
    border: "1px solid #f0f0f0", // Light border for each item
    borderRadius: "3px",
    backgroundColor: "#f9f9f9", // Slight background tint for items
    textAlign: "center", // Align text to the left within each item
    // You could use 'center' if preferred
    marginBottom: "0",
  },
};

export default AdditionalInfo;
