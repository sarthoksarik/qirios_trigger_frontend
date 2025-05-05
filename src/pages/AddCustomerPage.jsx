// src/pages/AddCustomerPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// *** Import the configured apiClient ***
import apiClient from '../api/axiosConfig'; // Adjust path if needed
// *** Remove the default axios import if it was present (it wasn't shown but good practice) ***
// import axios from 'axios';
import { useAppContext } from '../hooks/useAppContext'; // Import context hook

const AddCustomerPage = () => {
    // State for form fields
    const [name, setName] = useState('');
    const [didNumber, setDidNumber] = useState('');
    const [sheetUrl, setSheetUrl] = useState('');

    // State for submission status
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const navigate = useNavigate();
    const { fetchCustomers } = useAppContext(); // Get function to refresh customer list

    // *** REMOVE Hardcoded API Endpoint ***
    // const API_ENDPOINT = 'http://127.0.0.1:8000/api/customers/create-or-update-from-sheet/';

    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent default browser form submission

        if (!name.trim() || !didNumber.trim() || !sheetUrl.trim()) {
            setError('All fields are required.');
            setSuccessMessage('');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccessMessage('');

        const customerData = {
            name: name.trim(),
            did_number: didNumber.trim(),
            sheet_url: sheetUrl.trim(),
        };

        try {
            // *** Use apiClient and the RELATIVE path ***
            // The baseURL ('http://5.223.47.56:8000/api' or similar) is in apiClient config
            const response = await apiClient.post('/customers/create-or-update-from-sheet/', customerData);

            setSuccessMessage(response.data?.message || 'Customer added successfully!');
            setName('');
            setDidNumber('');
            setSheetUrl('');
            await fetchCustomers(); // Refresh the list via context (which also uses apiClient now)
            setTimeout(() => {
                navigate('/');
            }, 1500);

        } catch (err) {
            console.error('Error adding customer:', err);
            if (err.response && err.response.data) {
                 const backendError = err.response.data.error || err.response.data.detail || JSON.stringify(err.response.data);
                 setError(`Failed to add customer: ${backendError}`);
            } else if (err.request) {
                 // Modify error for connection refused specifically if needed
                 if (err.code === 'ERR_NETWORK' || err.message.includes('refused')) {
                    setError('Failed to add customer: Cannot connect to the server. Please check the API URL and ensure the server is running.');
                 } else {
                    setError('Failed to add customer: No response from server.');
                 }
            } else {
                setError(`Failed to add customer: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    // --- JSX for the form remains the same ---
    return (
        <div className="container mt-4" style={{ maxWidth: '600px' }}>
            <h2>Add New Customer</h2>
            <p>Enter the customer details and the Google Sheet URL to fetch their initial data.</p>

            <form onSubmit={handleSubmit}>
                {/* Customer Name */}
                <div className="mb-3">
                    <label htmlFor="customerName" className="form-label">Customer Name</label>
                    <input
                        type="text"
                        className="form-control"
                        id="customerName"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>

                {/* DID Number */}
                <div className="mb-3">
                    <label htmlFor="didNumber" className="form-label">DID Number</label>
                    <input
                        type="text"
                        className="form-control"
                        id="didNumber"
                        value={didNumber}
                        onChange={(e) => setDidNumber(e.target.value)}
                        required
                        disabled={loading}
                    />
                     <div className="form-text">
                        Enter the unique DID identifier for the customer.
                    </div>
                </div>

                {/* Sheet URL */}
                <div className="mb-3">
                    <label htmlFor="sheetUrl" className="form-label">Google Sheet URL</label>
                    <input
                        type="url"
                        className="form-control"
                        id="sheetUrl"
                        value={sheetUrl}
                        onChange={(e) => setSheetUrl(e.target.value)}
                        placeholder="https://docs.google.com/spreadsheets/d/..."
                        required
                        disabled={loading}
                    />
                    <div className="form-text">
                        Ensure the sheet is shared appropriately so the backend can access it.
                    </div>
                </div>

                {/* Submission Feedback */}
                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                {successMessage && <div className="alert alert-success" role="alert">{successMessage}</div>}

                {/* Submit Button */}
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            Adding...
                        </>
                    ) : (
                        'Add Customer & Fetch Data'
                    )}
                </button>
            </form>
        </div>
    );
};

export default AddCustomerPage;