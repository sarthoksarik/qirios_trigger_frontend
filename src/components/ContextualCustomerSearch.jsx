import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useAppContext } from "../hooks/useAppContext";

// A simple debounce utility function to delay searching while the user types.
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

const ContextualCustomerSearch = ({ onSearchFocusChange }) => {
  const {
    selectedCustomer,
    selectTitle,
    selectDemand,
    selectPatientType,
    setScrollToTarget,
  } = useAppContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const searchContainerRef = useRef(null);

  // --- State to track which "Demand" item is expanded ---
  // It will store the unique ID of the search result item.
  const [expandedItemId, setExpandedItemId] = useState(null);

  // 1. Prepare a flattened list of all searchable data from the selected customer.
  // This is memoized, so it only recalculates when the selectedCustomer changes.
  const searchableItems = useMemo(() => {
    if (!selectedCustomer?.demand_titles) return [];

    const items = [];
    let uniqueId = 0;

    selectedCustomer.demand_titles.forEach((title) => {
      const basePath = `Title: ${title.title}`;
      if (title.title) {
        items.push({
          id: `ctx-search-${uniqueId++}`,
          type: "title",
          textToSearch: title.title,
          displayPath: basePath,
          displayMatch: title.title,
          titleObj: title,
          demandObj: null,
          ptObj: null,
          fieldLabel: "Title",
        });
      }

      title.demands?.forEach((demand) => {
        const demandPath = `${basePath} > Demand: ${demand.name}`;
        if (demand.name) {
          items.push({
            id: `ctx-search-${uniqueId++}`,
            type: "demand",
            textToSearch: demand.name,
            displayPath: demandPath,
            displayMatch: demand.name,
            titleObj: title,
            demandObj: demand,
            ptObj: null,
            fieldLabel: "Demand",
          });
        }

        demand.patient_types?.forEach((pt) => {
          const ptPath = `${demandPath} > Type: ${pt.name}`;
          if (pt.name) {
            items.push({
              id: `ctx-search-${uniqueId++}`,
              type: "patientType",
              textToSearch: pt.name,
              displayPath: ptPath,
              displayMatch: pt.name,
              titleObj: title,
              demandObj: demand,
              ptObj: pt,
              fieldLabel: "Type",
            });
          }

          pt.actions?.forEach((action) => {
            const actionPathBase = `${ptPath} > Action`;
            if (action.description) {
              items.push({
                id: `ctx-search-${uniqueId++}`,
                type: "actionDescription",
                textToSearch: action.description,
                displayPath: `${actionPathBase} (Description)`,
                displayMatch: action.description,
                titleObj: title,
                demandObj: demand,
                ptObj: pt,
                fieldLabel: "Action Desc.",
              });
            }
            if (action.dire_text) {
              items.push({
                id: `ctx-search-${uniqueId++}`,
                type: "actionDireText",
                textToSearch: action.dire_text,
                displayPath: `${actionPathBase} (Dire Text)`,
                displayMatch: action.dire_text,
                titleObj: title,
                demandObj: demand,
                ptObj: pt,
                fieldLabel: "Action Dire Text",
              });
            }
          });
        });
      });
    });
    return items;
  }, [selectedCustomer]);

  // 2. Perform the search (debounced)
  const performSearch = useCallback(
    (currentSearchTerm) => {
      setExpandedItemId(null); // Collapse any expanded item on a new search
      if (!currentSearchTerm.trim() || !selectedCustomer) {
        setSearchResults([]);
        setIsDropdownVisible(false);
        return;
      }
      const lowerSearchTerm = currentSearchTerm.toLowerCase();
      const results = searchableItems.filter((item) =>
        item.textToSearch.toLowerCase().includes(lowerSearchTerm)
      );
      setSearchResults(results.slice(0, 15));
      setIsDropdownVisible(results.length > 0);
    },
    [searchableItems, selectedCustomer]
  );

  const debouncedSearch = useMemo(
    () => debounce(performSearch, 300),
    [performSearch]
  );

  const handleInputChange = (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    if (selectedCustomer) {
      debouncedSearch(newSearchTerm);
    } else {
      setSearchResults([]);
      setIsDropdownVisible(false);
    }
  };

  const handleInputFocus = () => {
    if (onSearchFocusChange) onSearchFocusChange(true);
    if ((searchTerm || searchResults.length > 0) && selectedCustomer) {
      setIsDropdownVisible(true);
    }
  };

  const deactivateSearch = useCallback(() => {
    setIsDropdownVisible(false);
    setExpandedItemId(null);
    if (onSearchFocusChange) onSearchFocusChange(false);
  }, [onSearchFocusChange]);

  // 3. Handle clicks on any item in the dropdown
  const handleResultClick = (item) => {
    // If the clicked item is a "Demand", toggle its expansion.
    if (item.type === "demand") {
      setExpandedItemId((prevId) => (prevId === item.id ? null : item.id));
      setScrollToTarget({ type: "demand", payload: item.demandObj });
      return; // Stop here and keep the dropdown open
    }

    // For any other item type (Title, PatientType, Action, or a dynamically added PatientTypeSelection),
    // we perform the final selection and close the search interface.
    selectTitle(item.titleObj);
    selectDemand(item.demandObj || null);
    selectPatientType(item.ptObj || null);
    // If the selection has a patient type, target it. Otherwise, target the demand.
    if (item.ptObj) {
      setScrollToTarget({ type: "patientType", payload: item.ptObj });
    } else if (item.demandObj) {
      setScrollToTarget({ type: "demand", payload: item.demandObj });
    }
    setSearchTerm("");
    setSearchResults([]);
    deactivateSearch();
  };

  // 4. Create the final list to be rendered, including injected patient types
  const displayResults = useMemo(() => {
    if (!expandedItemId) return searchResults;

    const finalResults = [];
    searchResults.forEach((item) => {
      finalResults.push(item); // Add the original result item first

      // If this is the expanded demand, inject its patient types as new items
      if (item.id === expandedItemId) {
        const patientTypes = item.demandObj?.patient_types || [];
        patientTypes.forEach((pt, index) => {
          finalResults.push({
            id: `${item.id}-pt-${index}`,
            type: "patientTypeSelection", // Special type to handle the click
            displayPath: `↳ Select Type:`, // Use an arrow to show it's a child
            displayMatch: pt.name,
            fieldLabel: "", // No field label needed for these
            titleObj: item.titleObj,
            demandObj: item.demandObj,
            ptObj: pt,
          });
        });
      }
    });
    return finalResults;
  }, [searchResults, expandedItemId]);

  // 5. Correctly highlight the search term in results
  const highlightMatch = (text, term) => {
    if (!term || !text || !term.trim()) return text;
    try {
      const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(${escapedTerm})`, "gi");
      const parts = String(text).split(regex);
      return parts.map((part, index) =>
        index % 2 === 1 ? <strong key={index}>{part}</strong> : part
      );
    } catch (e) {
      return text;
    }
  };

  // 6. Handle clicks outside the component to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        deactivateSearch();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [deactivateSearch]);

  const inputPlaceholder = selectedCustomer
    ? `Rechercher un terme dans ${selectedCustomer.name || "customer"}...`
    : "Select a customer";

  return (
    <div style={styles.searchContainerMain} ref={searchContainerRef}>
      <input
        type="text"
        placeholder={inputPlaceholder}
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        disabled={!selectedCustomer}
        style={
          selectedCustomer
            ? styles.searchInput
            : { ...styles.searchInput, ...styles.searchInputDisabled }
        }
      />
      {isDropdownVisible && displayResults.length > 0 && selectedCustomer && (
        <ul style={styles.dropdown}>
          {displayResults.map((item) => {
            const isExpanded = expandedItemId === item.id;
            const isSelectablePatientType =
              item.type === "patientTypeSelection";
            const itemStyle = {
              ...styles.dropdownItem,
              ...(isExpanded && styles.dropdownItemExpanded),
              ...(isSelectablePatientType && styles.patientTypeListItem),
            };

            return (
              <li
                key={item.id}
                onClick={() => handleResultClick(item)}
                style={itemStyle}
                title={item.displayPath}
              >
                <div style={styles.itemPath}>{item.displayPath}</div>
                <div style={styles.itemMatch}>
                  {item.fieldLabel ? `${item.fieldLabel}: ` : ""}
                  {highlightMatch(item.displayMatch, searchTerm)}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

// Styles for the component
const styles = {
  searchContainerMain: { position: "relative", width: "100%" },
  searchInput: {
    width: "100%",
    padding: "0.375rem 0.75rem",
    fontSize: "0.875rem",
    lineHeight: "1.5",
    color: "#fff",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    border: "1px solid rgba(255, 255, 255, 0.25)",
    borderRadius: "0.25rem",
    boxSizing: "border-box",
    transition:
      "background-color 0.15s ease-in-out, border-color 0.15s ease-in-out",
  },
  searchInputDisabled: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    cursor: "not-allowed",
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  dropdown: {
    position: "absolute",
    top: "calc(100% + 2px)",
    left: "0",
    right: "0",
    border: "1px solid rgba(0,0,0,0.15)",
    borderRadius: "0 0 0.25rem 0.25rem",
    backgroundColor: "white",
    color: "#212529",
    listStyleType: "none",
    margin: 0,
    padding: 0,
    maxHeight: "calc(100vh - 120px)",
    overflowY: "auto",
    zIndex: 1101,
    boxShadow: "0 0.5rem 1rem rgba(0,0,0,0.175)",
    textAlign: "left",
  },
  dropdownItem: {
    padding: "10px 15px",
    cursor: "pointer",
    borderBottom: "1px solid #dee2e6",
    transition: "background-color 0.2s ease",
  },
  dropdownItemExpanded: {
    backgroundColor: "#e9ecef", // Highlights the "Demand" that is expanded
  },
  patientTypeListItem: {
    paddingLeft: "30px", // Indents the patient types
    backgroundColor: "#f8f9fa",
    // For hover, add this to your main CSS file:
    // .patient-type-list-item:hover { background-color: #e2e6ea; }
  },
  itemPath: {
    fontSize: "0.75em",
    color: "#6c757d",
    marginBottom: "4px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  itemMatch: {
    fontSize: "0.9em",
    color: "#212529",
    wordBreak: "break-word",
  },
};

export default ContextualCustomerSearch;
