// src/components/ContextualCustomerSearch.jsx
import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useAppContext } from "../hooks/useAppContext";

// Debounce utility function
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
  const { selectedCustomer, selectTitle, selectDemand, selectPatientType } =
    useAppContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const searchContainerRef = useRef(null);

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

  const deactivateSearchAndInformParent = useCallback(() => {
    setIsDropdownVisible(false);
    if (onSearchFocusChange) onSearchFocusChange(false);
  }, [onSearchFocusChange]);

  const handleSelectResult = (item) => {
    if (item.titleObj) {
      selectTitle(item.titleObj);
      if (item.demandObj) {
        selectDemand(item.demandObj);
        if (item.ptObj) {
          selectPatientType(item.ptObj);
        } else {
          selectPatientType(null);
        }
      } else {
        selectDemand(null);
        selectPatientType(null);
      }
    } else {
      selectTitle(null);
      selectDemand(null);
      selectPatientType(null);
    }
    setSearchTerm("");
    setSearchResults([]);
    deactivateSearchAndInformParent();
  };

  const highlightMatch = (text, term) => {
    if (!term || !text || !term.trim()) return text;
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
      return text;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        deactivateSearchAndInformParent();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [deactivateSearchAndInformParent]);

  const inputPlaceholder = selectedCustomer
    ? `Search in ${selectedCustomer.name || "customer"}...`
    : "Select customer";

  return (
    <div style={styles.searchContainerMain} ref={searchContainerRef}>
      {" "}
      {/* Changed style key */}
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
                {item.fieldLabel}:{" "}
                {highlightMatch(item.displayMatch, searchTerm)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Styles (ensure these are appropriate for embedding in Navbar)
const styles = {
  searchContainerMain: {
    // Renamed to avoid conflict if Navbar uses 'searchContainer'
    position: "relative",
    width: "100%", // Will fill its wrapper in Navbar
  },
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
    zIndex: 9999, // Higher than navbar's zIndex
    boxShadow: "0 0.5rem 1rem rgba(0,0,0,0.175)",
    textAlign: "left",
  },
  dropdownItem: {
    padding: "10px 15px",
    cursor: "pointer",
    borderBottom: "1px solid #dee2e6",
  },
  itemPath: {
    fontSize: "0.75em",
    color: "#6c757d",
    marginBottom: "4px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  itemMatch: { fontSize: "0.9em", color: "#212529", wordBreak: "break-word" },
};

export default ContextualCustomerSearch;
