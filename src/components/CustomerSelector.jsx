// src/components/CustomerSelector.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';

const CustomerSelector = () => {
  // Get only what's needed for the grid view
  const { customers, selectedCustomer, selectCustomer, loading, error } = useAppContext();
  const navigate = useNavigate();

  // --- Handler for Grid Button Click ---
  const handleButtonClick = (did) => {
      selectCustomer(did); // Select in context
      navigate(`/profile/${did}`); // Navigate to profile
  };

  // --- Helpers for display text (Copied from original) ---
  const getDisplayText = (customer) => { // For tooltip
      const title = customer.filetitle?.trim();
      const name = customer.name?.trim();
      if (title) { return `${title}${name ? ` (${name})` : ''}`; }
      else if (name) { return `${name} (${customer.did_number})`; }
      else { return `Customer (${customer.did_number})`; }
  };
   const getButtonText = (customer) => { // For button content
        const title = customer.filetitle?.trim();
        const name = customer.name?.trim();
        if (title) {
            return (
                 <>
                    <span style={{ fontWeight: 500, fontSize: '0.75rem' }}>{title}</span> {/* Smaller main text */}
                    {name && <br />}
                    {/* Even smaller secondary text */}
                    {name && <small className="text-muted" style={{ fontSize: '0.65rem' }}>({name})</small>}
                 </>
            );
        } else if (name) {
             return (
                 <>
                    <span style={{ fontWeight: 500, fontSize: '0.75rem' }}>{name}</span> {/* Smaller main text */}
                    <br />
                    <small className="text-muted" style={{ fontSize: '0.65rem' }}>({customer.did_number})</small> {/* Smaller DID */}
                 </>
             );
        } else {
            return <span style={{ fontSize: '0.7rem' }}>Cust ({customer.did_number})</span>; // Fallback small text
        }
   };

  // --- Only render grid if not loading, no error, and customers exist ---
  if (loading || error || !customers || customers.length === 0) {
    // Don't render the grid container if there's nothing to show or loading/error
    // Error/loading messages handled elsewhere potentially (like Navbar or below)
    return null;
  }

  return (
    // --- Main Container: Reduced padding/margin ---
    <div className="mb-2 p-1 bg-light rounded shadow-sm"> {/* Reduced mb-2 p-1 */}
        {/* Grid Section */}
         <div
           // Reduced gap, padding; keep other classes
           className="d-flex flex-wrap gap-1 border p-1 rounded"
           // Reduced max-height further, ensure scrolling
           style={{ maxHeight: '90px', overflowY: 'auto', overflowX: 'hidden' }}
         >
             {customers.map((customer) => (
                 <button
                     key={customer.did_number}
                     type="button"
                     // Added btn-xs equivalent using padding/font-size
                     className={`btn btn-sm ${selectedCustomer?.did_number === customer.did_number ? 'btn-primary' : 'btn-outline-secondary'}`}
                     onClick={() => handleButtonClick(customer.did_number)}
                     style={{
                         flex: '1 0 auto', // Keep flex behavior
                         fontSize: '0.7rem', // Make overall button font smaller
                         lineHeight: '1.1', // Tighter line height
                         padding: '0.15rem 0.3rem' // Smaller padding -> "btn-xs" feel
                        }}
                     title={getDisplayText(customer)} // Tooltip shows full info
                 >
                    {getButtonText(customer)}
                 </button>
             ))}
         </div>
    </div> // End of main container
  );
};

export default CustomerSelector;