// src/components/CustomerSelector.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';

const CustomerSelector = () => {
  const { customers, selectedCustomer, selectCustomer, loading, error } = useAppContext();
  const navigate = useNavigate();

  const handleSelectChange = (event) => {
    const did = event.target.value;
    if (did) {
      selectCustomer(did);
      navigate(`/profile/${did}`);
    } else {
      selectCustomer(null);
      navigate('/');
    }
  };

  const handleButtonClick = (did) => {
      selectCustomer(did);
      navigate(`/profile/${did}`);
  };

  // Helper to determine display text, prioritizing filetitle
  const getDisplayText = (customer) => {
      const title = customer.filetitle?.trim();
      const name = customer.name?.trim();
      if (title) {
          // Format: Spreadsheet Title (Customer Name)
          return `${title}${name ? ` (${name})` : ''}`;
      } else if (name) {
          // Fallback to Customer Name (DID) if no filetitle
          return `${name} (${customer.did_number})`;
      } else {
           // Fallback if neither title nor name exists
           return `Customer (${customer.did_number})`;
      }
  };

  // Helper for button grid text (maybe slightly different format)
   const getButtonText = (customer) => {
        const title = customer.filetitle?.trim();
        const name = customer.name?.trim();
        if (title) {
            return ( // Return JSX for multi-line content
                 <>
                    <span style={{ fontWeight: 500 }}>{title}</span>
                    {name && <br />}
                    {name && <small className="text-muted">({name})</small>}
                 </>
            );
        } else if (name) {
             return (
                 <>
                    <span style={{ fontWeight: 500 }}>{name}</span>
                    <br />
                    <small className="text-muted">({customer.did_number})</small>
                 </>
             );
        } else {
            return `Customer (${customer.did_number})`;
        }
   };


  return (
    // Reduce overall padding (p-2) and bottom margin (mb-3)
    <div className="mb-3 p-2 bg-light rounded shadow-sm">
      {/* Use h6 and small font size */}
      <h6 className="mb-2" style={{ fontSize: '0.95rem' }}>Select Customer</h6>

      {/* Dropdown Selector Section */}
      <div className="mb-2"> {/* Reduced margin */}
        {/* Use label with smaller font */}
        {/* <label htmlFor="customerDropdown" className="form-label form-label-sm mb-1">By Dropdown:</label> */}
        {loading && !customers.length && <p><small>Loading customers...</small></p>}
        {error && !loading && <p className="text-danger mb-1"><small>{error}</small></p>}
        {!loading && customers.length > 0 && (
          <select
            id="customerDropdown"
            className="form-select form-select-sm" // Use smaller select control
            value={selectedCustomer?.did_number || ''}
            onChange={handleSelectChange}
            aria-label="Select Customer Dropdown"
          >
            <option value="">-- Select Customer --</option>
            {customers.map((customer) => (
              <option key={customer.did_number} value={customer.did_number}>
                {/* Display filetitle (Customer Name) */}
                {getDisplayText(customer)}
              </option>
            ))}
          </select>
        )}
        {!loading && !error && customers.length === 0 && (
          <p><small>No customers found.</small></p>
        )}
      </div>

      {/* Grid Selector Section - Appears below the dropdown */}
      <div>
        {/* <label className="form-label form-label-sm mb-1">By Grid:</label> */}
         {/* Reduce max-height for shorter scroll area */}
         {/* Show grid only if customers are loaded */}
         {!loading && customers.length > 0 && (
             <div
               className="d-flex flex-wrap gap-1 border p-1 rounded" // Reduced gap, padding
               style={{ maxHeight: '120px', overflowY: 'auto' }} // Reduced max height significantly
             >
                 {customers.map((customer) => (
                     <button
                         key={customer.did_number}
                         type="button"
                         // Keep btn-sm, adjust padding if needed via custom class or inline style
                         className={`btn btn-sm ${selectedCustomer?.did_number === customer.did_number ? 'btn-primary' : 'btn-outline-secondary'}`}
                         onClick={() => handleButtonClick(customer.did_number)}
                         style={{
                             flex: '1 0 auto', // Let buttons size more naturally but allow wrapping
                             fontSize: '0.75rem', // Smaller font size for buttons
                             lineHeight: '1.2', // Adjust line height for smaller text
                             padding: '0.2rem 0.4rem' // Adjust padding
                            }}
                         title={getDisplayText(customer)} // Tooltip shows full info
                     >
                         {/* Display filetitle / name in button */}
                        {getButtonText(customer)}
                     </button>
                 ))}
             </div>
          )}
      </div>

    </div> // End of main container
  );
};

export default CustomerSelector;