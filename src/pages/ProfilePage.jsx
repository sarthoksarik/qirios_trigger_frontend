// src/pages/ProfilePage.jsx
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
// import DemandTitleList from '../components/DemandTitleList'; // *** REMOVE THIS IMPORT ***
import DataColumns from '../components/DataColumns'; // DataColumns now handles rendering titles and data

const ProfilePage = () => {
  const { customerId } = useParams(); // Get customerId from URL
  const {
      selectCustomer,
      selectedCustomer,
      loading,
      error,
      customers, // Need customers list to find the one
      fetchCustomers, // Need fetchCustomers in case navigated directly
      setError // To set specific errors
   } = useAppContext();

  // Effect to fetch customers if navigated directly to this page
  useEffect(() => {
      if (customers.length === 0 && !loading) {
          fetchCustomers();
      }
  }, [customers.length, loading, fetchCustomers]);

  // Effect to select the customer based on the URL parameter
  useEffect(() => {
    if (customerId && customers.length > 0) {
         if (selectedCustomer?.did_number !== customerId) {
            selectCustomer(customerId);
         }
    } else if (customerId && !loading && customers.length === 0 && !error) {
        // Added !error check to avoid setting error if fetch failed
         setError(`Attempted to load profile ${customerId}, but customer list is empty.`);
    }
  }, [customerId, selectCustomer, customers, loading, selectedCustomer, setError, error]); // Added error to dependency array


  // Render Logic
  return (
    // Container div provided by <Outlet /> in Layout.jsx
    // Removed the extra wrapper div from previous example
    <>
       {/* Loading Indicator */}
       {loading && <p>Loading customer profile...</p>}

       {/* Error Display */}
       {error && !loading && <p className="text-danger">{error}</p>}

       {/* Render data columns ONLY if the correct customer is selected and no errors/loading */}
       {selectedCustomer && selectedCustomer.did_number === customerId && !loading && !error && (
           <>
             {/* Optional: Heading for the profile */}
             {/* <h5 className="mb-3">Details for {selectedCustomer.name}</h5> */}

             {/* Render ONLY DataColumns - It includes the Title List internally */}
             <DataColumns />

             {/* *** REMOVED <DemandTitleList /> from here *** */}
           </>
        )}

        {/* Handle case where ID is in URL but customer not found after load attempt */}
        {!selectedCustomer && !loading && error && customerId && error.includes(customerId) && (
            <div className="p-3 bg-warning-subtle rounded text-center">
                 <p className="mb-0">Could not find customer with ID: {customerId}</p>
            </div>
        )}
     </>
  );
};

export default ProfilePage;