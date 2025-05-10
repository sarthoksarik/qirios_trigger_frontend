// src/pages/ProfilePage.jsx
import React, { useEffect, useState, useRef } from 'react'; // Import useState and useRef
import { useParams } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import DataColumns from '../components/DataColumns'; // Assuming this is used for display

const ProfilePage = () => {
    const { customerId } = useParams();
    //const navigate = useNavigate(); // Use navigate if needed for error redirection

    const {
        customers,
        loading: contextLoading,
        error: contextError,
        selectedCustomer,
        selectCustomer,
        fetchCustomers, // Keep for initial load scenario
        setError,       // Keep for setting errors
        updateSelectedCustomerFromSheet // *** Get the update function ***
    } = useAppContext();

    // --- State and Ref for managing initial update ---
    // State to track if the selection based on URL has been processed by the first effect
    const [initialSelectionProcessed, setInitialSelectionProcessed] = useState(false);
    // Ref to ensure the update API call is triggered only once per direct load
    const hasTriggeredInitialUpdate = useRef(false);

    // --- Effect 1: Handle initial customer fetch (if needed) ---
    useEffect(() => {
        // If navigated directly and list is empty, fetch it
        if (customers.length === 0 && !contextLoading) {
            console.log("ProfilePage Effect 1a: Customer list empty, fetching...");
            fetchCustomers();
        }
    }, [customers.length, contextLoading, fetchCustomers]);


    // --- Effect 2: Select customer based on URL ---
    useEffect(() => {
        console.log(`ProfilePage Effect 2 (Select): URL=${customerId}, Loading=${contextLoading}, Customers=${customers.length}, Selected=${selectedCustomer?.did_number}`);
        setInitialSelectionProcessed(false); // Reset flag when dependencies change

        if (customerId && !contextLoading && customers.length > 0) {
            const customerExists = customers.some(c => c.did_number === customerId);

            if (!customerExists) {
                console.error(`ProfilePage Effect 2: Customer ${customerId} not found in list.`);
                setError(`Customer with ID ${customerId} not found.`); // Set context error
                return; // Stop processing this effect
            }

            // If customer exists, check if selection needs update
            if (selectedCustomer?.did_number !== customerId) {
                console.log(`ProfilePage Effect 2: Selecting customer ${customerId}.`);
                selectCustomer(customerId);
                // Mark that selection based on URL was attempted/done
                setInitialSelectionProcessed(true);
            } else {
                // Already selected - mark selection as processed for this URL ID
                 console.log(`ProfilePage Effect 2: Customer ${customerId} already selected.`);
                setInitialSelectionProcessed(true);
            }
        } else if (customerId && !contextLoading && customers.length === 0 && !contextError) {
             console.warn(`ProfilePage Effect 2: Attempted load for ${customerId}, but customer list is empty.`);
             setError(`Attempted to load profile ${customerId}, but customer list is empty.`);
             setInitialSelectionProcessed(false); // Ensure flag is false if list is empty
        } else {
            setInitialSelectionProcessed(false); // Reset if conditions aren't met
        }

    }, [customerId, contextLoading, customers, selectedCustomer, selectCustomer, setError, contextError]); // Dependencies for selection logic


    // --- Effect 3: Trigger update after selection is confirmed ---
    useEffect(() => {
        console.log(`ProfilePage Effect 3 (Update Check): Processed=${initialSelectionProcessed}, TriggeredRef=${hasTriggeredInitialUpdate.current}, SelectedDID=${selectedCustomer?.did_number}, URL_DID=${customerId}`);

        // Trigger update only if:
        // 1. The selection process based on the URL ID is marked as processed.
        // 2. The *currently* selected customer in context actually matches the URL ID.
        // 3. The initial update trigger hasn't happened yet for this component instance/load.
        if (initialSelectionProcessed && selectedCustomer?.did_number === customerId && !hasTriggeredInitialUpdate.current) {
            console.log(`ProfilePage Effect 3: Triggering initial update for ${customerId}.`);

            // Prevent triggering again on this load
            hasTriggeredInitialUpdate.current = true;

            // Call the context function to trigger the update
            updateSelectedCustomerFromSheet();

            setInitialSelectionProcessed(false); // Reset intermediate state
        }

    // Depend on the intermediate state, the selected customer, the URL id, and the update function itself
    }, [initialSelectionProcessed, selectedCustomer, customerId, updateSelectedCustomerFromSheet]);


    // --- Render Logic (Similar to your previous version) ---
    return (
        <>
            {/* Loading Indicator - Show if context is loading AND selected doesn't match URL yet */}
            {contextLoading && selectedCustomer?.did_number !== customerId && (
                 <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '150px' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}

            {/* Error Display */}
            {contextError && !contextLoading && (
                 // Show context error if it exists after loading
                 <div className="alert alert-danger">Error: {contextError}</div>
            )}

            {/* Render data columns ONLY if loading is done, no error, and correct customer is selected */}
            {selectedCustomer && selectedCustomer.did_number === customerId && !contextLoading && !contextError && (
                <>
                    {/* <h5 className="mb-3">Details for {selectedCustomer.name}</h5> */}
                    <DataColumns />
                </>
            )}

            {/* Specific "Not Found" message if loading is done, error exists, and it matches the expected "not found" pattern */}
            {!contextLoading && contextError && typeof contextError === 'string' && contextError.includes(customerId) && (
                 <div className="alert alert-warning">Could not find customer with ID: {customerId}</div>
            )}
        </>
    );
};

export default ProfilePage;