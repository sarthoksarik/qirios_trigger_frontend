// src/components/GlobalSearch.jsx
import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useAppContext } from "../hooks/useAppContext";
import { useNavigate } from "react-router-dom"; // Import useNavigate

// Simple debounce utility function (if not already present)
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

const GlobalSearch = () => {
  const {
    customers,
    selectCustomer,
    selectTitle,
    selectDemand,
    selectPatientType,
  } = useAppContext();
  const navigate = useNavigate(); // Hook for navigation

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const searchContainerRef = useRef(null);

  // 1. Prepare and flatten data for searching (useMemo - from previous example)
  const searchableItems = useMemo(() => {
    if (!customers || customers.length === 0) return [];
    const items = [];
    let uniqueId = 0;
    customers.forEach((customer) => {
      const addItem = (text, label, pathContext, selectionObjects) => {
        if (text && String(text).trim() !== "") {
          items.push({
            id: `search-item-${uniqueId++}`,
            customer: customer,
            matchedString: String(text),
            fieldLabel: label,
            displayContext: `${customer.name} > ${pathContext}`,
            ...selectionObjects,
          });
        }
      };
      addItem(customer.name, "Name", "Name", {});
      addItem(customer.did_number, "DID Number", "DID", {});
      addItem(customer.address, "Address", "Address", {});
      addItem(customer.note1, "Note 1", "Note 1", {});
      addItem(customer.note2, "Note 2", "Note 2", {});
      addItem(customer.note3, "Note 3", "Note 3", {});
      addItem(customer.filetitle, "File Title", "File Title", {});
      customer.demand_titles?.forEach((title) => {
        addItem(title.title, "Title", `Title: ${title.title}`, {
          titleForSelection: title,
        });
        title.demands?.forEach((demand) => {
          addItem(
            demand.name,
            "Demand",
            `Title: ${title.title} > Demand: ${demand.name}`,
            { titleForSelection: title, demandForSelection: demand }
          );
          demand.patient_types?.forEach((pt) => {
            addItem(
              pt.name,
              "Patient Type",
              `... > Demand: ${demand.name} > PT: ${pt.name}`,
              {
                titleForSelection: title,
                demandForSelection: demand,
                patientTypeForSelection: pt,
              }
            );
            pt.actions?.forEach((action) => {
              addItem(
                action.description,
                "Action Desc.",
                `... > PT: ${pt.name} > Action Desc.`,
                {
                  titleForSelection: title,
                  demandForSelection: demand,
                  patientTypeForSelection: pt,
                }
              );
              addItem(
                action.dire_text,
                "Action Dire Text",
                `... > PT: ${pt.name} > Action Dire Text`,
                {
                  titleForSelection: title,
                  demandForSelection: demand,
                  patientTypeForSelection: pt,
                }
              );
            });
          });
        });
      });
    });
    return items;
  }, [customers]);

  // 2. Debounced search function (useCallback, useMemo - from previous example)
  const performSearch = useCallback(
    (currentSearchTerm) => {
      if (!currentSearchTerm.trim()) {
        setSearchResults([]);
        setIsDropdownVisible(false);
        return;
      }
      const lowerSearchTerm = currentSearchTerm.toLowerCase();
      const results = searchableItems.filter((item) =>
        item.matchedString.toLowerCase().includes(lowerSearchTerm)
      );
      setSearchResults(results.slice(0, 15));
      setIsDropdownVisible(results.length > 0);
    },
    [searchableItems]
  );
  const debouncedSearch = useMemo(
    () => debounce(performSearch, 300),
    [performSearch]
  );

  // 3. Handle input change (from previous example)
  const handleInputChange = (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    debouncedSearch(newSearchTerm);
  };

  // 4. Handle selection from dropdown - MODIFIED for navigation
  const handleSelectResult = (resultItem) => {
    console.log("Search result selected:", resultItem); // DEBUGGING
    console.log(
      "GlobalSearch: Clicked Search Result Item:",
      JSON.stringify(
        resultItem,
        (key, value) => {
          // Custom replacer to avoid circular structures if customer object is too complex for simple stringify
          // and to see title names clearly.
          if (key === "customer")
            return `Customer DID: ${value.did_number}, Name: ${value.name}`;
          if (key === "titleForSelection" && value)
            return `Title Object: ${value.title}`;
          if (key === "demandForSelection" && value)
            return `Demand Object: ${value.name}`;
          if (key === "patientTypeForSelection" && value)
            return `PT Object: ${value.name}`;
          return value;
        },
        2
      )
    );

    // Step 1: Always select the customer. This will clear existing title, demand, patient type in context.
    selectCustomer(resultItem.customer.did_number);
    console.log("Called selectCustomer with:", resultItem.customer.did_number); // DEBUGGING

    // Step 2: Sequentially select deeper context if available in the search result item.
    // These calls will progressively refine the selection.
    if (resultItem.titleForSelection) {
      console.log(
        "Calling selectTitle with:",
        resultItem.titleForSelection.title
      ); // DEBUGGING
      selectTitle(resultItem.titleForSelection); // This will clear demand & patient type again

      if (resultItem.demandForSelection) {
        console.log(
          "Calling selectDemand with:",
          resultItem.demandForSelection.name
        ); // DEBUGGING
        selectDemand(resultItem.demandForSelection); // This will clear patient type again

        if (resultItem.patientTypeForSelection) {
          console.log(
            "Calling selectPatientType with:",
            resultItem.patientTypeForSelection.name
          ); // DEBUGGING
          selectPatientType(resultItem.patientTypeForSelection); // This sets the patient type and its actions
        }
      }
    }
    // If only the customer matched (e.g., customer.name), titleForSelection will be undefined.
    // In this case, selectCustomer() already correctly set title, demand, patientType to null.

    // Step 3: Navigate to the profile page for the selected customer
    if (resultItem.customer.did_number) {
      navigate(`/profile/${resultItem.customer.did_number}`);
    }

    // Step 4: Clear search UI
    setSearchTerm("");
    setSearchResults([]);
    setIsDropdownVisible(false);
  };

  // Highlight matched term (from previous example)
  const highlightMatch = (text, term) => {
    if (!term.trim()) return text;
    const regex = new RegExp(
      `(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = String(text).split(regex);
    return (
      <>
        {parts.map((part, index) =>
          regex.test(part) ? <strong key={index}>{part}</strong> : part
        )}
      </>
    );
  };

  // Handle clicking outside (from previous example)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setIsDropdownVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // JSX for input and dropdown (from previous example, ensure styles are defined)
  return (
    <div style={styles.searchContainer} ref={searchContainerRef}>
      <input
        type="text"
        placeholder="Search customer, title, demand, action..."
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => {
          if (searchResults.length > 0 || searchTerm)
            setIsDropdownVisible(true);
        }}
        style={styles.searchInput}
      />
      {isDropdownVisible && searchResults.length > 0 && (
        <ul style={styles.dropdown}>
          {searchResults.map((item) => (
            <li
              key={item.id}
              onClick={() => handleSelectResult(item)}
              style={styles.dropdownItem}
              title={`Select: ${item.displayContext} - ${item.fieldLabel}: ${item.matchedString}`} // Added title for better hover info
            >
              <div style={styles.itemContext}>{item.displayContext}</div>
              <div style={styles.itemMatch}>
                {item.fieldLabel}:{" "}
                {highlightMatch(item.matchedString, searchTerm)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Basic styles (ensure this 'styles' object is defined as in the previous response)
const styles = {
  searchContainer: {
    position: "relative",
    width: "100%",
    fontFamily: "Arial, sans-serif",
  }, // Adjusted margin
  searchInput: {
    width: "100%",
    fontSize: "0.95 rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
    boxSizing: "border-box",
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: "0",
    right: "0",
    border: "1px solid #ccc",
    borderTop: "none",
    borderRadius: "0 0 4px 4px",
    backgroundColor: "white",
    listStyleType: "none",
    margin: 0,
    padding: 0,
    maxHeight: "400px",
    overflowY: "auto",
    zIndex: 1000,
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  },
  dropdownItem: {
    padding: "10px 12px",
    cursor: "pointer",
    borderBottom: "1px solid #eee",
    "&:hover": { backgroundColor: "#f0f0f0" },
  }, // Note: pseudo-selectors like :hover don't work directly in inline styles
  itemContext: {
    fontSize: "0.8em",
    color: "#555",
    marginBottom: "4px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  itemMatch: { fontSize: "0.95em", color: "#333" },
};

export default GlobalSearch;
