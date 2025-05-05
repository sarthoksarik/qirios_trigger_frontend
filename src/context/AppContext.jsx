import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Define the base URL for your Django API (Adjust if necessary)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'; // Fallback for safety
const AppContext = createContext();

const AppProvider = ({ children }) => {
    // --- State Variables ---
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedTitle, setSelectedTitle] = useState(null);
    const [selectedDemand, setSelectedDemand] = useState(null);
    const [selectedPatientType, setSelectedPatientType] = useState(null); // Still needed for highlighting UI
    const [selectedActions, setSelectedActions] = useState([]); // Actions selected in the bar
    const [loading, setLoading] = useState(false); // For initial customer list load
    const [error, setError] = useState(null); // For list load/selection errors

    // State for the update operation initiated from the navbar button
    const [isUpdatingCustomer, setIsUpdatingCustomer] = useState(false);
    const [updateError, setUpdateError] = useState(null);
    const [updateSuccessMessage, setUpdateSuccessMessage] = useState('');
    // --- End State Variables ---

    // --- Data Fetching ---
    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        setError(null);
        const targetUrl = `${API_BASE_URL}/customers/`
        console.log("Fetching customers from:", targetUrl); 
        try {
            const response = await axios.get(targetUrl);
            console.log("API Response Status:", response.status); // <-- ADDED LOG
            console.log("API Response Data:", response.data); // <-- ADDED LOG (Crucial!)
            // Safer check before setting state
            setCustomers(Array.isArray(response.data) ? response.data : [])
        } catch (err) {
            console.error("Error fetching customers:", err);
            setError("Failed to load customer data. Please ensure the backend is running.");
            setCustomers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch customers when the provider mounts
    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    // --- Selection Logic ---
    const selectCustomer = useCallback((customerDid) => {
        // Clear previous status messages
        setUpdateError(null);
        setUpdateSuccessMessage('');
        setError(null); // Also clear general errors

        setLoading(true);
        const customer = customers.find(c => c.did_number === customerDid);
        if (customer) {
            setSelectedCustomer(customer);
            // Reset downstream selections
            setSelectedTitle(null);
            setSelectedDemand(null);
            setSelectedPatientType(null);
            setSelectedActions([]); // Clear actions bar when customer changes
        } else {
            setError(`Customer with ID ${customerDid} not found.`);
            setSelectedCustomer(null); // Clear selection if not found
        }
        setLoading(false);
    }, [customers]);

    const selectTitle = (title) => {
        setSelectedTitle(title);
        // Reset downstream selections
        setSelectedDemand(null);
        setSelectedPatientType(null);
        // Clear status messages
        setUpdateError(null);
        setUpdateSuccessMessage('');
    };

    const selectDemand = (demand) => {
        setSelectedDemand(demand);
        // Reset patient type selection
        setSelectedPatientType(null);
         // Clear status messages
        setUpdateError(null);
        setUpdateSuccessMessage('');
    };
    // --- End Selection Logic ---


    // --- Action Management (for Selection Bar) ---
    const addAction = useCallback((action) => {
        // Ensure action has a description and isn't already selected
        if (action && action.description && !selectedActions.some(sa => sa.description === action.description)) {
            setSelectedActions(prev => [...prev, action]);
        }
    }, [selectedActions]); // Dependency: selectedActions

    const removeAction = (actionToRemove) => {
        setSelectedActions(prev => prev.filter(action => action.description !== actionToRemove.description));
    };

    const clearActions = () => {
        setSelectedActions([]);
    };
    // --- End Action Management ---


    // --- MODIFIED selectPatientType ---
    // Now also adds all actions of the selected type to the Selection Bar
    const selectPatientType = useCallback((patientType) => {
        // 1. Set state to highlight the selected Patient Type in the UI
        setSelectedPatientType(patientType);

        // 2. Add all actions associated with this patientType to the selection bar
        if (patientType && patientType.actions && patientType.actions.length > 0) {
            console.log(`Adding actions for Patient Type: ${patientType.name}`);
            // Use a temporary set to avoid potential issues if addAction wasn't memoized correctly
            // or if state updates aren't immediate within the loop (though addAction handles duplicates now)
            patientType.actions.forEach(action => {
                addAction(action); // Call memoized addAction which handles duplicates
            });
        } else {
             console.log(`No actions to add for Patient Type: ${patientType?.name}`);
        }
         // Clear status messages
        setUpdateError(null);
        setUpdateSuccessMessage('');

    }, [addAction]); // Dependency: addAction function (which depends on selectedActions)


    // --- Function to Update Selected Customer From Sheet (Navbar Button) ---
    const updateSelectedCustomerFromSheet = useCallback(async () => {
        if (!selectedCustomer) {
            setUpdateError("No customer selected to update.");
            setTimeout(() => setUpdateError(null), 5000);
            return;
        }

        setIsUpdatingCustomer(true);
        setUpdateError(null);
        setUpdateSuccessMessage('');

        const updateData = {
            name: selectedCustomer.name,
            did_number: selectedCustomer.did_number,
            sheet_url: selectedCustomer.sheet_url,
        };

        try {
            // POST to the backend endpoint
            const response = await axios.post(`${API_BASE_URL}/customers/create-or-update-from-sheet/`, updateData);
            setUpdateSuccessMessage(response.data?.message || 'Update triggered! Refreshing...');

            // Refresh the selected customer's data locally after successful POST
            try {
                const refreshResponse = await axios.get(`${API_BASE_URL}/customers/${selectedCustomer.did_number}/`);
                setSelectedCustomer(refreshResponse.data); // Update state with fresh data
                // Reset selections below customer level
                setSelectedTitle(null);
                setSelectedDemand(null);
                setSelectedPatientType(null);
                setSelectedActions([]); // Clear actions bar after update
                setUpdateSuccessMessage('Customer data refreshed successfully!');

            } catch (refreshErr) {
                console.error("Error refreshing customer data after update:", refreshErr);
                setUpdateError("Update submitted, but failed to refresh local data. Please re-select the customer manually.");
                setTimeout(() => setUpdateError(null), 7000);
            }

            setTimeout(() => setUpdateSuccessMessage(''), 3000); // Clear success message

        } catch (err) {
            console.error("Error updating customer:", err);
             if (err.response && err.response.data) {
                const backendError = err.response.data.error || err.response.data.detail || JSON.stringify(err.response.data);
                setUpdateError(`Update failed: ${backendError}`);
            } else if (err.request) {
                setUpdateError('Update failed: No response from server.');
            } else {
                setUpdateError(`Update failed: ${err.message}`);
            }
            setTimeout(() => setUpdateError(null), 5000); // Clear error message
        } finally {
            setIsUpdatingCustomer(false);
        }

    }, [selectedCustomer, addAction]); // Dependency: selectedCustomer and addAction
    // --- End Update Function ---


    // --- Context Value ---
    // Assemble the state and functions provided by the context
    const value = {
        customers,
        selectedCustomer,
        selectedTitle,
        selectedDemand,
        selectedPatientType, // Still needed for highlighting Patient Type column
        selectedActions,
        loading,
        error,
        fetchCustomers,
        selectCustomer,
        selectTitle,
        selectDemand,
        selectPatientType, // Provide the modified version
        addAction,
        removeAction,
        clearActions,
        setError,
        isUpdatingCustomer,
        updateError,
        updateSuccessMessage,
        updateSelectedCustomerFromSheet,
    };
    // --- End Context Value ---

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export { AppContext, AppProvider };