// src/components/Layout.jsx
import React, { useEffect } from 'react'; // Import useEffect
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import CustomerSelector from './CustomerSelector';
import SelectionBar from './SelectionBar';
import { useAppContext } from '../hooks/useAppContext';

const Layout = () => {
  const {
      selectedActions,
      updateError, // Get update status from context
      updateSuccessMessage // Get update status from context
     } = useAppContext();

  // Optional: Clear messages if component unmounts? Usually handled by context itself.

  return (
    <>
      <Navbar />
      <div className="container-fluid mt-3 px-md-4">

        {/* Sticky Container */}
        <div style={{
            position: 'sticky',
            top: 0,
            zIndex: 1020,
            backgroundColor: 'var(--bs-body-bg, white)',
            paddingBottom: '0.5rem'
         }}>
          <CustomerSelector />
          {selectedActions.length > 0 && <SelectionBar />}
        </div>

        {/* Display Update Status Messages */}
        {/* These appear below the sticky section but above the main page content */}
        {updateError && (
            <div className="alert alert-danger alert-dismissible fade show mt-2" role="alert">
                {updateError}
                {/* Optionally add a close button if errors shouldn't auto-clear */}
                {/* <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button> */}
            </div>
        )}
        {updateSuccessMessage && (
             <div className="alert alert-success alert-dismissible fade show mt-2" role="alert">
                {updateSuccessMessage}
            </div>
         )}


        {/* Outlet for Page-Specific Content */}
        <div className="mt-1"> {/* Reduced margin slightly to accommodate alerts */}
          <Outlet />
        </div>

      </div>
    </>
  );
};

export default Layout;