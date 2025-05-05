// src/components/Layout.jsx
import React from 'react'; // Removed unused useEffect import for now
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import CustomerSelector from './CustomerSelector';
import SelectionBar from './SelectionBar';
import { useAppContext } from '../hooks/useAppContext';

const Layout = () => {
  const {
      // --- CORRECTED: Use currentActions ---
      currentActions,
      updateError,
      updateSuccessMessage
     } = useAppContext();

  return (
    <>
      <Navbar />
      <div className="container-fluid mt-3 px-md-4">
        <div style={{
            position: 'sticky',
            top: 0,
            zIndex: 1020,
            backgroundColor: 'var(--bs-body-bg, white)', // Ensure background for sticky
            paddingBottom: '0.5rem' // Add padding if needed
         }}>
          <CustomerSelector />
          {/* --- CORRECTED: Check currentActions.length --- */}
          {/* Optional chaining ?. is even safer in case currentActions is briefly not an array */}
          {currentActions?.length > 0 && <SelectionBar />}
        </div>

        {/* Display Update Status Messages */}
        {updateError && (
            <div className="alert alert-danger alert-dismissible fade show mt-2" role="alert">
                {updateError}
            </div>
        )}
        {updateSuccessMessage && (
             <div className="alert alert-success alert-dismissible fade show mt-2" role="alert">
                {updateSuccessMessage}
            </div>
         )}

        {/* Outlet for Page-Specific Content */}
        <div className="mt-1">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default Layout;