// src/components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext'; // Import context hook

const Navbar = () => {
  // Get state and functions from context needed for the update button
  const {
      selectedCustomer,
      updateSelectedCustomerFromSheet,
      isUpdatingCustomer
    } = useAppContext();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-3">
      <div className="container-fluid">
        {/* Brand Link */}
        <Link className="navbar-brand" to="/">Customer File Manager</Link>

        {/* Navbar Toggler Button */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Collapsible Content */}
        <div className="collapse navbar-collapse" id="navbarNav">
          {/* Navigation Links */}
          <ul className="navbar-nav ms-auto align-items-center"> {/* Use align-items-center for vertical alignment */}

            {/* Update Button - Appears only when a customer is selected */}
            {selectedCustomer && (
               <li className="nav-item me-2"> {/* Add margin-end for spacing */}
                 <button
                   className="btn btn-sm btn-outline-warning d-flex align-items-center"
                   onClick={updateSelectedCustomerFromSheet}
                   // Disable if no customer selected OR if update is in progress
                   disabled={!selectedCustomer || isUpdatingCustomer}
                   title={selectedCustomer ? `Refresh data for ${selectedCustomer.name} from sheet` : 'Select a customer first'}
                 >
                   {isUpdatingCustomer ? (
                     <>
                       <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                       Updating...
                     </>
                   ) : (
                     <>
                       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-clockwise me-1" viewBox="0 0 16 16">
                         <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"/>
                         <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466"/>
                       </svg>
                       Update Current
                     </>
                   )}
                 </button>
               </li>
             )}

            {/* Add New Customer Button/Link */}
            <li className="nav-item">
              <Link className="btn btn-sm btn-outline-success" to="/add-customer">
                + Add New Customer
              </Link>
            </li>

          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;