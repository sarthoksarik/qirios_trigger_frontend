// src/context/AppContext.js

import React, { createContext, useState, useEffect, useCallback } from "react";
// Remove the default axios import
// import axios from 'axios';
// Import the configured apiClient instance
import apiClient from "../api/axiosConfig"; // Adjust the path if necessary!

// Define the base URL (now likely handled within apiClient, but keep for reference if needed elsewhere)
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const AppContext = createContext();

const AppProvider = ({ children }) => {
  // --- State Variables (Unchanged) ---
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedTitle, setSelectedTitle] = useState(null);
  const [selectedDemand, setSelectedDemand] = useState(null);
  const [selectedPatientType, setSelectedPatientType] = useState(null);
  const [currentActions, setCurrentActions] = useState([]); // Renamed state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isUpdatingCustomer, setIsUpdatingCustomer] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccessMessage, setUpdateSuccessMessage] = useState("");
  // --- End State Variables ---

  // --- Data Fetching ---
  // Use apiClient
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    // Base URL is now part of apiClient configuration
    // const targetUrl = `/customers/` // Relative path
    console.log("Fetching customers...");
    try {
      // Use apiClient instance
      console.log(import.meta.env.VITE_API_BASE_URL);
      const response = await apiClient.get("/customers/");
      console.log("API Response Status:", response.status);
      console.log("API Response Data:", response.data);
      setCustomers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError(
        "Failed to load customer data. Please ensure the backend is running and CORS/CSRF settings are correct."
      );
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []); // No state dependencies needed here

  // Fetch customers when the provider mounts
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // --- Selection Logic (Unchanged logic, but ensure context value is updated) ---
  const selectCustomer = useCallback(
    (customerDid) => {
      setUpdateError(null);
      setUpdateSuccessMessage("");
      setError(null);
      setLoading(true); // Keep loading state for selection feedback if needed
      const customer = customers.find((c) => c.did_number === customerDid);
      if (customer) {
        setSelectedCustomer(customer);
        setSelectedTitle(null);
        setSelectedDemand(null);
        setSelectedPatientType(null);
        setCurrentActions([]);
      } else {
        // Set error if customer not found in the loaded list
        setError(`Customer with ID ${customerDid} not found.`);
        setSelectedCustomer(null);
      }
      setLoading(false);
    },
    [customers]
  ); // Depends on the main customer list

  const selectTitle = useCallback((title) => {
    console.log(
      "AppContext: selectTitle CALLED WITH:",
      title ? title.title : null
    ); // Log what it received
    console.trace("selectTitle WAS CALLED FROM THIS STACK:");
    setSelectedTitle(title);
    setSelectedDemand(null);
    setSelectedPatientType(null);
    setCurrentActions([]);
    setUpdateError(null);
    setUpdateSuccessMessage("");
    setError(null); // Clear general errors too
  }, []); // No state dependencies

  const selectDemand = useCallback((demand) => {
    setSelectedDemand(demand);
    setSelectedPatientType(null);
    setCurrentActions([]);
    setUpdateError(null);
    setUpdateSuccessMessage("");
    setError(null); // Clear general errors too
  }, []); // No state dependencies

  // --- Action Management (using currentActions) ---
  const removeCurrentAction = useCallback((actionToRemove) => {
    if (actionToRemove?.description) {
      setCurrentActions((prev) =>
        prev.filter(
          (action) => action.description !== actionToRemove.description
        )
      );
    }
  }, []); // No state dependencies

  const clearCurrentActions = useCallback(() => {
    setCurrentActions([]);
  }, []); // No state dependencies

  // Sets actions based on selected patient type
  const selectPatientType = useCallback((patientType) => {
    setSelectedPatientType(patientType);
    if (patientType && Array.isArray(patientType.actions)) {
      console.log(`Setting actions for Patient Type: ${patientType.name}`);
      setCurrentActions(patientType.actions);
    } else {
      console.log(
        `Clearing actions (no valid actions for Patient Type: ${patientType?.name})`
      );
      setCurrentActions([]);
    }
    setUpdateError(null);
    setUpdateSuccessMessage("");
    setError(null); // Clear errors
  }, []); // No state dependencies

  // --- Function to Update Selected Customer From Sheet ---
  // Use apiClient
  const updateSelectedCustomerFromSheet = useCallback(async () => {
    // Function might be called before selection is fully settled, ensure selectedCustomer exists
    if (!selectedCustomer) {
      console.warn("Update triggered but no customer selected.");
      setUpdateError("No customer selected to update.");
      // Optional: Clear message after timeout
      // setTimeout(() => setUpdateError(null), 5000);
      return;
    }

    console.log(`Attempting update for: ${selectedCustomer.did_number}`);
    setIsUpdatingCustomer(true);
    setUpdateError(null);
    setUpdateSuccessMessage("");
    setError(null); // Clear general errors

    const updateData = {
      name: selectedCustomer.name,
      did_number: selectedCustomer.did_number,
      sheet_url: selectedCustomer.sheet_url,
    };

    try {
      // Use apiClient instance for the POST request
      const response = await apiClient.post(
        "/customers/create-or-update-from-sheet/",
        updateData
      );
      console.log("Update API response:", response.data);
      setUpdateSuccessMessage(
        response.data?.message ||
          "Update triggered successfully! Refreshing data..."
      );

      // Refresh the selected customer's data locally after successful POST
      try {
        console.log(`Refreshing data for ${selectedCustomer.did_number}`);
        // Use apiClient instance for the GET request
        const refreshResponse = await apiClient.get(
          `/customers/${selectedCustomer.did_number}/`
        );
        // Update local state ONLY if the refreshed customer still matches the selection
        // Prevents race conditions if user clicks elsewhere during update
        if (
          selectedCustomer &&
          refreshResponse.data?.did_number === selectedCustomer.did_number
        ) {
          setSelectedCustomer(refreshResponse.data);
          // Reset selections below customer level as data might have changed
          setSelectedTitle(null);
          setSelectedDemand(null);
          setSelectedPatientType(null);
          clearCurrentActions(); // Use the existing clear function
          //setUpdateSuccessMessage('Customer data refreshed successfully!');
          console.log("Customer data refreshed successfully.");
        } else {
          console.log(
            "Selected customer changed during refresh, not updating local state."
          );
          // Don't clear the success message here, update was likely still successful
        }
      } catch (refreshErr) {
        console.error(
          "Error refreshing customer data after update:",
          refreshErr
        );
        // Keep the initial success message, but add warning about refresh failure
        setUpdateError(
          "Update submitted, but failed to refresh local data. Please re-select the customer manually."
        );
        // Optional: Clear error after timeout
        // setTimeout(() => setUpdateError(null), 7000);
      }

      // Optional: Clear success message after timeout
      // setTimeout(() => setUpdateSuccessMessage(''), 3000);
    } catch (err) {
      console.error("Error updating customer:", err);
      // Extract more specific error message if possible
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error Response Data:", err.response.data);
        console.error("Error Response Status:", err.response.status);
        console.error("Error Response Headers:", err.response.headers);
        const backendError =
          err.response.data?.error ||
          err.response.data?.detail ||
          `Server responded with status ${err.response.status}`;
        setUpdateError(`Update failed: ${backendError}`);
      } else if (err.request) {
        // The request was made but no response was received
        console.error("Error Request:", err.request);
        setUpdateError(
          "Update failed: No response from server. Is it running?"
        );
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error Message:", err.message);
        setUpdateError(`Update failed: ${err.message}`);
      }
      // Optional: Clear error message after timeout
      // setTimeout(() => setUpdateError(null), 5000);
    } finally {
      setIsUpdatingCustomer(false);
    }

    // Dependencies: selectedCustomer is needed to get data for the request.
    // clearCurrentActions is called.
    // Other state setters (setIsUpdatingCustomer, etc.) are stable and don't need to be dependencies.
  }, [selectedCustomer, clearCurrentActions]);
  // --- End Update Function ---

  // --- Context Value (Ensure all exported functions/state are correct) ---
  const value = {
    customers,
    selectedCustomer,
    selectedTitle,
    selectedDemand,
    selectedPatientType,
    currentActions, // Use the renamed state
    loading,
    error, // General fetch/select errors
    fetchCustomers,
    selectCustomer,
    selectTitle,
    selectDemand,
    selectPatientType,
    removeCurrentAction, // Renamed function
    clearCurrentActions, // Renamed function
    setError, // Allow components to set general errors if needed
    isUpdatingCustomer, // Update-specific loading state
    updateError, // Update-specific error message
    updateSuccessMessage, // Update-specific success message
    updateSelectedCustomerFromSheet, // The update function
  };
  // --- End Context Value ---

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export { AppContext, AppProvider };
