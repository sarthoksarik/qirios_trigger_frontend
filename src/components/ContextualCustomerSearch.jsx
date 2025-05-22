// src/components/ContextualCustomerSearch.jsx
import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useAppContext } from "../hooks/useAppContext";

// Simple debounce utility function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

const ContextualCustomerSearch = () => {
  const { selectedCustomer, selectTitle, selectDemand, selectPatientType } =
    useAppContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const searchContainerRef = useRef(null);

  const searchableItems = useMemo(() => {
    if (!selectedCustomer?.demand_titles) {
      return [];
    }

    const items = [];
    let uniqueId = 0;

    selectedCustomer.demand_titles.forEach((title) => {
      const basePath = `Title: ${title.title}`;
      if (title.title) {
        // Searchable Title
        items.push({
          id: `ctx-search-${uniqueId++}`,
          type: "title",
          textToSearch: title.title,
          displayPath: basePath,
          displayMatch: title.title,
          titleObj: title,
          demandObj: null,
          ptObj: null,
        });
      }

      title.demands?.forEach((demand) => {
        const demandPath = `${basePath} > Demand: ${demand.name}`;
        if (demand.name) {
          // Searchable Demand
          items.push({
            id: `ctx-search-${uniqueId++}`,
            type: "demand",
            textToSearch: demand.name,
            displayPath: demandPath,
            displayMatch: demand.name,
            titleObj: title,
            demandObj: demand,
            ptObj: null,
          });
        }

        demand.patient_types?.forEach((pt) => {
          const ptPath = `${demandPath} > PT: ${pt.name}`;
          if (pt.name) {
            // Searchable Patient Type
            items.push({
              id: `ctx-search-${uniqueId++}`,
              type: "patientType",
              textToSearch: pt.name,
              displayPath: ptPath,
              displayMatch: pt.name,
              titleObj: title,
              demandObj: demand,
              ptObj: pt,
            });
          }

          pt.actions?.forEach((action) => {
            const actionPathBase = `${ptPath} > Action`;
            if (action.description) {
              // Searchable Action Description
              items.push({
                id: `ctx-search-${uniqueId++}`,
                type: "actionDescription",
                textToSearch: action.description,
                displayPath: `${actionPathBase} (Description)`,
                displayMatch: action.description,
                titleObj: title,
                demandObj: demand,
                ptObj: pt,
              });
            }
            if (action.dire_text) {
              // Searchable Action Dire Text
              items.push({
                id: `ctx-search-${uniqueId++}`,
                type: "actionDireText",
                textToSearch: action.dire_text,
                displayPath: `${actionPathBase} (Dire Text)`,
                displayMatch: action.dire_text,
                titleObj: title,
                demandObj: demand,
                ptObj: pt,
              });
            }
          });
        });
      });
    });
    return items;
  }, [selectedCustomer]);

  const performSearch = useCallback(
    (currentSearchTerm) => {
      if (
        !currentSearchTerm.trim() ||
        !selectedCustomer ||
        searchableItems.length === 0
      ) {
        setSearchResults([]);
        setIsDropdownVisible(false);
        return;
      }
      const lowerSearchTerm = currentSearchTerm.toLowerCase();
      const results = searchableItems.filter((item) =>
        item.textToSearch.toLowerCase().includes(lowerSearchTerm)
      );
      setSearchResults(results.slice(0, 10)); // Show top N results
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
      // Only search if a customer is selected
      debouncedSearch(newSearchTerm);
    } else {
      setSearchResults([]);
      setIsDropdownVisible(false);
    }
  };

  const handleSelectResult = (item) => {
    console.log("ContextualSearch: Selecting item's context:", item);
    // These calls will update the AppContext, and components like DataColumns will react
    selectTitle(item.titleObj);
    selectDemand(item.demandObj || null); // Pass null if not applicable to clear
    selectPatientType(item.ptObj || null); // Pass null if not applicable to clear

    setSearchTerm("");
    setSearchResults([]);
    setIsDropdownVisible(false);
  };

  const highlightMatch = (text, term) => {
    if (!term.trim() || !text) return text;
    try {
      const regex = new RegExp(
        `(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
        "gi"
      );
      return String(text)
        .split(regex)
        .map((part, index) =>
          regex.test(part) ? <strong key={index}>{part}</strong> : part
        );
    } catch (e) {
      console.error("Error highlighting match:", e);
      return text;
    }
  };

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

  // If no customer is selected, perhaps disable the input or show a different placeholder
  const inputPlaceholder = selectedCustomer
    ? "Search in current customer..."
    : "Select a customer to search";

  return (
    <div style={styles.searchContainer} ref={searchContainerRef}>
      <input
        type="text"
        placeholder={inputPlaceholder}
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => {
          if (searchResults.length > 0 || (searchTerm && selectedCustomer))
            setIsDropdownVisible(true);
        }}
        disabled={!selectedCustomer} // Disable if no customer selected
        style={
          selectedCustomer
            ? styles.searchInput
            : { ...styles.searchInput, ...styles.searchInputDisabled }
        }
      />
      {isDropdownVisible && searchResults.length > 0 && selectedCustomer && (
        <ul style={styles.dropdown}>
          {searchResults.map((item) => (
            <li
              key={item.id}
              onClick={() => handleSelectResult(item)}
              style={styles.dropdownItem}
              title={item.displayPath}
            >
              <div style={styles.itemPath}>{item.displayPath}</div>
              <div style={styles.itemMatch}>
                {highlightMatch(item.displayMatch, searchTerm)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Basic styles - you'll likely want to integrate these with your app's styling / Navbar
const styles = {
  searchContainer: {
    position: "relative",
    minWidth: "200px", // Adjust as needed for Navbar
    margin: "0 10px", // Example margin for Navbar placement
  },
  searchInput: {
    width: "100%",
    padding: "0.2rem 0.5rem", // Smaller padding for navbar
    fontSize: "0.8rem", // Smaller font for navbar
    border: "1px solid #495057", // Darker border to match bg-dark theme potentially
    borderRadius: "0.2rem",
    backgroundColor: "#50585f", // Darker input bg
    color: "white",
    boxSizing: "border-box",
  },
  searchInputDisabled: {
    backgroundColor: "#6c757d",
    cursor: "not-allowed",
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: "0",
    right: "0",
    border: "1px solid #343a40",
    borderRadius: "0 0 4px 4px",
    backgroundColor: "#495057", // Darker dropdown
    color: "white",
    listStyleType: "none",
    margin: 0,
    padding: 0,
    maxHeight: "300px", // Adjust height
    overflowY: "auto",
    zIndex: 1100, // Ensure it's above navbar items if necessary
    boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
    textAlign: "left",
  },
  dropdownItem: {
    padding: "8px 10px",
    cursor: "pointer",
    borderBottom: "1px solid #5a6268",
  },
  // Add a hover style for dropdownItem using CSS classes or a library if you use one
  // e.g., .dropdownItem:hover { backgroundColor: '#5a6268'; }
  itemPath: {
    fontSize: "0.7rem",
    color: "#adb5bd", // Lighter color for path
    marginBottom: "3px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  itemMatch: {
    fontSize: "0.8rem",
    // color: 'white', // Already white from dropdown color
  },
};

export default ContextualCustomerSearch;
