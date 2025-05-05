// src/pages/AddCustomerPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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

    // Backend API endpoint
    const API_ENDPOINT = 'http://127.0.0.1:8000/api/customers/create-or-update-from-sheet/';

    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent default browser form submission

        // Basic frontend validation
        if (!name.trim() || !didNumber.trim() || !sheetUrl.trim()) {
            setError('All fields are required.');
            setSuccessMessage('');
            return;
        }
        // You could add more specific validation (e.g., URL format) here

        setLoading(true);
        setError(null);
        setSuccessMessage('');

        const customerData = {
            name: name.trim(),
            did_number: didNumber.trim(),
            sheet_url: sheetUrl.trim(),
        };

        try {
            const response = await axios.post(API_ENDPOINT, customerData);

            // Handle success based on backend response structure
            // Assuming backend sends back a message on success
            setSuccessMessage(response.data?.message || 'Customer added successfully!');
            // console.log('API Response:', response.data); // For debugging

            // Clear the form
            setName('');
            setDidNumber('');
            setSheetUrl('');

            // Refresh the global customer list
            await fetchCustomers();

            // Optionally navigate away after a short delay
            setTimeout(() => {
                navigate('/'); // Redirect to home page after success
            }, 1500); // Wait 1.5 seconds

        } catch (err) {
            console.error('Error adding customer:', err);
            // Handle errors - check for specific response errors from backend if available
            if (err.response && err.response.data) {
                 // Try to extract specific errors (depends on backend structure)
                 const backendError = err.response.data.error || err.response.data.detail || JSON.stringify(err.response.data);
                 setError(`Failed to add customer: ${backendError}`);
            } else if (err.request) {
                setError('Failed to add customer: No response from server. Is the backend running?');
            } else {
                setError(`Failed to add customer: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4" style={{ maxWidth: '600px' }}> {/* Constrain form width */}
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
                        required // HTML5 basic validation
                        disabled={loading}
                    />
                </div>

                {/* DID Number */}
                <div className="mb-3">
                    <label htmlFor="didNumber" className="form-label">DID Number</label>
                    <input
                        type="text"
                        // Use pattern for basic format check if desired, e.g., pattern="\d{6,10}"
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
                        type="url" // Use type="url" for basic URL validation
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
                    disabled={loading} // Disable button while loading
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