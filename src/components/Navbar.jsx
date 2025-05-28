// src/components/Navbar.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../hooks/useAppContext";
import ContextualCustomerSearch from "./ContextualCustomerSearch";

const Navbar = () => {
  const {
    customers,
    selectedCustomer,
    selectCustomer: selectCustomerFromContext,
    loading: contextLoading,
    error: contextError,
    updateSelectedCustomerFromSheet,
    isUpdatingCustomer,
  } = useAppContext();

  const navigate = useNavigate();
  const [isSearchModeActive, setIsSearchModeActive] = useState(false);

  const handleCustomerDropdownChange = (event) => {
    const did = event.target.value;
    setIsSearchModeActive(false); // Ensure search mode is off when changing customer
    if (did) {
      selectCustomerFromContext(did);
      navigate(`/profile/${did}`);
    } else {
      selectCustomerFromContext(null);
      navigate("/");
    }
  };

  const getDisplayText = (customer) => {
    const title = customer.filetitle?.trim();
    const name = customer.name?.trim();
    if (title) return `${title}${name ? ` (${name})` : ""}`;
    if (name) return `${name} (${customer.did_number})`;
    return `Customer (${customer.did_number})`;
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark bg-dark py-1"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1030, // Standard Bootstrap z-index
        // The body max-width of 465px will constrain this navbar
      }}
    >
      <div
        className="container-fluid px-2 px-md-3 d-flex align-items-center"
        // Removed justify-content-between to allow search to expand better
        // when other items are hidden. Items will naturally space out or align start.
      >
        {/* Customer Select Dropdown: Visible when search is NOT active */}
        {!isSearchModeActive && (
          <div
            className="customer-select-container me-2"
            style={navbarStyles.customerSelectWrapper}
          >
            {!contextLoading && !contextError && customers.length > 0 ? (
              <select
                id="customerNavbarDropdown"
                className="form-select form-select-sm bg-dark text-light border-secondary"
                value={selectedCustomer?.did_number || ""}
                onChange={handleCustomerDropdownChange}
                aria-label="Select Customer"
                style={{ fontSize: "0.8rem" }}
              >
                <option value="" style={{ fontStyle: "italic" }}>
                  -- Select Customer --
                </option>
                {[...customers]
                  .sort((a, b) => {
                    const getPrefix = (str) =>
                      str?.match(/^(\d+)-/)
                        ? parseInt(str.match(/^(\d+)-/)[1], 10)
                        : Infinity;
                    return getPrefix(a.filetitle) - getPrefix(b.filetitle);
                  })
                  .map((customer) => (
                    <option
                      key={customer.did_number}
                      value={customer.did_number}
                    >
                      {getDisplayText(customer)}
                    </option>
                  ))}
              </select>
            ) : (
              <span
                className="navbar-text text-light"
                style={{ fontSize: "0.8rem", minWidth: "150px" }}
              >
                {contextLoading ? "Loading..." : "No Customers"}
              </span>
            )}
          </div>
        )}

        {/* Contextual Search Component Wrapper */}
        <div
          style={
            isSearchModeActive
              ? navbarStyles.searchWrapperActive
              : navbarStyles.searchWrapperInactive
          }
        >
          <ContextualCustomerSearch
            onSearchFocusChange={setIsSearchModeActive}
          />
        </div>

        {/* Right side elements & Toggler: Visible when search is NOT active */}
        {!isSearchModeActive && (
          <>
            {/* Toggler needs to be after the search or other expanding elements if they push it */}
            <button
              className="navbar-toggler ms-2" // ms-2 for spacing from search if it's not full width
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNavContent"
              aria-controls="navbarNavContent"
              aria-expanded="false"
              aria-label="Toggle navigation"
              style={{ fontSize: "0.8rem", padding: "0.1rem 0.3rem" }}
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarNavContent">
              <ul className="navbar-nav ms-auto align-items-center">
                {selectedCustomer && (
                  <li className="nav-item ms-lg-2 me-1 me-lg-0 order-lg-last">
                    {" "}
                    {/* order-lg-last to keep Add button more to the left */}
                    <button
                      className="btn btn-sm btn-outline-warning d-flex align-items-center"
                      onClick={() => {
                        updateSelectedCustomerFromSheet();
                        setIsSearchModeActive(false);
                      }}
                      disabled={!selectedCustomer || isUpdatingCustomer}
                      title={
                        selectedCustomer
                          ? `Refresh ${selectedCustomer.name}`
                          : "Select customer"
                      }
                      style={{ fontSize: "0.8rem", padding: "0.2rem 0.5rem" }}
                    >
                      {isUpdatingCustomer ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-1"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Updating...
                        </>
                      ) : (
                        "Update Sheet"
                      )}
                    </button>
                  </li>
                )}
                <li className="nav-item order-lg-first">
                  {" "}
                  {/* order-lg-first to keep Add button to the left */}
                  <Link
                    className="btn btn-sm btn-outline-success"
                    to="/add-customer"
                    onClick={() => setIsSearchModeActive(false)}
                    style={{ fontSize: "0.8rem", padding: "0.2rem 0.5rem" }}
                  >
                    + Add
                  </Link>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

const navbarStyles = {
  customerSelectWrapper: {
    // flex-shrink: 0, // Don't shrink customer select
    // minWidth: '180px', // Give it a decent min-width
    maxWidth: "200px", // Control max width
  },
  searchWrapperInactive: {
    flexGrow: 1, // Takes available space
    minWidth: "150px", // Minimum width for the search input
    transition: "all 0.3s ease-in-out",
    // marginLeft: '10px', // If customer select is present
  },
  searchWrapperActive: {
    width: "100%", // Takes full width of its parent container (the d-flex container-fluid)
    transition: "all 0.3s ease-in-out",
  },
};

export default Navbar;
