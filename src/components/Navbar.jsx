// src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../hooks/useAppContext";

const Navbar = () => {
  const {
    customers,
    selectedCustomer,
    selectCustomer,
    loading: contextLoading,
    error: contextError,
    updateSelectedCustomerFromSheet,
    isUpdatingCustomer,
  } = useAppContext();

  const navigate = useNavigate();

  const handleSelectChange = (event) => {
    const did = event.target.value;
    if (did) {
      selectCustomer(did);
      navigate(`/profile/${did}`);
    } else {
      selectCustomer(null);
      navigate("/");
    }
  };

  const getDisplayText = (customer) => {
    const title = customer.filetitle?.trim();
    const name = customer.name?.trim();
    if (title) {
      return `${title}${name ? ` (${name})` : ""}`;
    } else if (name) {
      return `${name} (${customer.did_number})`;
    } else {
      return `Customer (${customer.did_number})`;
    }
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark bg-dark py-1"
      style={{
        position: "sticky",
        top: 0,
      }}
    >
      <div className="container-fluid px-2 px-md-3">
        {/* Customer Dropdown (Brand Position) */}
        {!contextLoading && !contextError && customers.length > 0 && (
          <div
            className="d-flex align-items-center"
            style={{ maxWidth: "300px" }}
          >
            <select
              id="customerNavbarDropdown"
              className="form-select form-select-sm bg-dark text-light border-secondary"
              value={selectedCustomer?.did_number || ""}
              onChange={handleSelectChange}
              aria-label="Select Customer Dropdown"
              style={{ fontSize: "0.8rem" }}
            >
              <option value="" style={{ fontStyle: "italic" }}>
                -- Select Customer --
              </option>
              {[...customers]
                .sort((a, b) => {
                  const getPrefixNumber = (str) => {
                    const match = str?.match(/^(\d+)-/);
                    return match ? parseInt(match[1], 10) : Infinity;
                  };

                  return (
                    getPrefixNumber(a.filetitle) - getPrefixNumber(b.filetitle)
                  );
                })
                .map((customer) => (
                  <option key={customer.did_number} value={customer.did_number}>
                    {getDisplayText(customer)}
                  </option>
                ))}
            </select>
          </div>
        )}
        {(contextLoading || contextError || customers.length === 0) && (
          <span
            className="navbar-text"
            style={{ fontSize: "1rem", marginRight: "auto" }}
          >
            {contextLoading ? "Loading..." : "Customer Select"}
          </span>
        )}

        {/* Navbar Toggler Button --- MODIFIED --- */}
        <button
          className="navbar-toggler" // Keep base class
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
          // Add inline style to scale it down and adjust padding
          style={{
            fontSize: "0.8rem", // Reduce font size which affects em units
            padding: "0.1rem 0.3rem", // Reduce padding significantly
            // Optional: Scale transform for further reduction if padding isn't enough
            // transform: 'scale(0.8)',
            // transformOrigin: 'center center'
          }}
        >
          {/* The icon inside will shrink slightly due to font-size if it uses em units,
              or you might need custom CSS targeting .navbar-toggler-icon if needed */}
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Collapsible Content */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            {/* Update Button */}
            {selectedCustomer && (
              <li className="nav-item me-1 me-lg-2">
                {
                  <button
                    className="btn btn-sm btn-outline-warning d-flex align-items-center"
                    onClick={updateSelectedCustomerFromSheet}
                    disabled={!selectedCustomer || isUpdatingCustomer}
                    title={
                      selectedCustomer
                        ? `Refresh data for ${selectedCustomer.name} from sheet`
                        : "Select a customer first"
                    }
                    style={{
                      fontSize: "0.8rem",
                      padding: "0.2rem 0.5rem",
                    }}
                  >
                    {/* ... Button Content ... */}
                    {isUpdatingCustomer ? <>...</> : <>Updt</>}
                  </button>
                }
              </li>
            )}
            {/* Add New Customer Button/Link */}
            <li className="nav-item">
              <Link
                className="btn btn-sm btn-outline-success"
                to="/add-customer"
                style={{ fontSize: "0.8rem", padding: "0.2rem 0.5rem" }}
              >
                Add
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
