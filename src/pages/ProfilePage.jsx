// src/pages/ProfilePage.jsx
import React, { useEffect } from "react"; // Import useState and useRef
import { useParams } from "react-router-dom";
import { useAppContext } from "../hooks/useAppContext";
import DataColumns from "../components/DataColumns";
import AdditionalInfo from "../components/AdditionalInfo";
import SelectionBar from "../components/SelectionBar";
import GlobalSearch from "../components/GlobalSearch";

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
    setError, // Keep for setting errors
    currentActions,
  } = useAppContext();

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
    //   console.log(
    //     `ProfilePage Effect 2 (Select): URL=${customerId}, Loading=${contextLoading}, Customers=${customers.length}, Selected=${selectedCustomer?.did_number}`
    //   );
    //   // setInitialSelectionProcessed(false); // Reset flag when dependencies change

    //   if (customerId && !contextLoading && customers.length > 0) {
    //     const customerExists = customers.some((c) => c.did_number === customerId);

    //     if (!customerExists) {
    //       console.error(
    //         `ProfilePage Effect 2: Customer ${customerId} not found in list.`
    //       );
    //       setError(`Customer with ID ${customerId} not found.`); // Set context error
    //       return; // Stop processing this effect
    //     }

    //     // If customer exists, check if selection needs update
    //     if (selectedCustomer?.did_number !== customerId) {
    //       console.log(`ProfilePage Effect 2: Selecting customer ${customerId}.`);
    //       selectCustomer(customerId);
    //       // Mark that selection based on URL was attempted/done
    //       //setInitialSelectionProcessed(true);
    //     } else {
    //       // Already selected - mark selection as processed for this URL ID
    //       console.log(
    //         `ProfilePage Effect 2: Customer ${customerId} already selected.`
    //       );
    //       //setInitialSelectionProcessed(true);
    //     }
    //   } else if (
    //     customerId &&
    //     !contextLoading &&
    //     customers.length === 0 &&
    //     !contextError
    //   ) {
    //     console.warn(
    //       `ProfilePage Effect 2: Attempted load for ${customerId}, but customer list is empty.`
    //     );
    //     setError(
    //       `Attempted to load profile ${customerId}, but customer list is empty.`
    //     );
    //     // Ensure flag is false if list is empty
    //   }
    // }, [
    //   customerId,
    //   contextLoading,
    //   customers,
    //   selectedCustomer,
    //   selectCustomer,
    //   setError,
    //   contextError,
    // ]); // Dependencies for selection logic
    const currentUrlCustomerId = customerId;

    console.log(
      `ProfilePage Effect 2 (Select Customer by URL): URL_customerId=${currentUrlCustomerId}, ` +
        `ContextLoading=${contextLoading}, Customers.length=${customers.length}, ` +
        `SelectedCustomerDID=${selectedCustomer?.did_number}, ContextError=${contextError}`
    );

    // Scenario 1: Still loading customer data from AppContext
    if (contextLoading) {
      console.log("ProfilePage Effect 2: Customers are loading. Waiting...");
      return; // Wait for loading to complete
    }

    // Scenario 2: Loading is complete (contextLoading is false)
    // We must have a customerId from the URL to proceed
    if (!currentUrlCustomerId) {
      console.log(
        "ProfilePage Effect 2: No customerId from URL. Cannot select."
      );
      // Optionally, clear selection or set an error if this state is unexpected
      // selectCustomer(null);
      // setError("No customer ID specified in the URL.");
      return;
    }

    // At this point, contextLoading is false, and we have a currentUrlCustomerId.
    // Now check the customers array.
    if (customers.length > 0) {
      const customerExists = customers.some(
        (c) => c.did_number === currentUrlCustomerId
      );

      if (customerExists) {
        if (selectedCustomer?.did_number !== currentUrlCustomerId) {
          console.log(
            `ProfilePage Effect 2: Customer list loaded. Selecting customer ${currentUrlCustomerId}.`
          );
          selectCustomer(currentUrlCustomerId); // This call will also clear title, demand, patient type in AppContext
        } else {
          console.log(
            `ProfilePage Effect 2: Customer ${currentUrlCustomerId} already selected and matches URL.`
          );
        }
      } else {
        // Customers are loaded, but the specific customerId from URL was not found in the list.
        console.error(
          `ProfilePage Effect 2: Customer ${currentUrlCustomerId} not found in the loaded list of ${customers.length} customers.`
        );
        if (!contextError) {
          // Avoid overwriting a more general fetch error from AppContext
          setError(
            `Customer with ID ${currentUrlCustomerId} not found in the available list.`
          );
        }
      }
    } else {
      // Loading is complete (contextLoading is false), but customers array is empty.
      // This means the fetch completed but returned no customers, or an error occurred during fetch
      // that AppContext handled by setting customers to [] (and possibly contextError).
      if (!contextError) {
        // If AppContext didn't already set an error for the fetch itself
        console.warn(
          `ProfilePage Effect 2: Customer list is empty after loading (0 customers fetched). Cannot find/select customer ${currentUrlCustomerId}.`
        );
        setError(
          `No customers were loaded from the backend. Unable to display profile for ${currentUrlCustomerId}.`
        );
      } else {
        // An error already exists from the context (e.g., API fetch failed)
        console.warn(
          `ProfilePage Effect 2: Customer list empty after loading, an existing context error is present: ${contextError}. Cannot find/select customer ${currentUrlCustomerId}.`
        );
      }
    }
    // --- END OF NEW REFINED LOGIC ---
  }, [
    customerId,
    contextLoading,
    customers,
    selectedCustomer,
    selectCustomer,
    setError,
    contextError,
  ]);
  return (
    <>
      {/* Loading Indicator - Show if context is loading AND selected doesn't match URL yet */}
      {contextLoading && selectedCustomer?.did_number !== customerId && (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "150px" }}
        >
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
      {selectedCustomer &&
        selectedCustomer.did_number === customerId &&
        !contextLoading &&
        !contextError && (
          <>
            {/* <h5 className="mb-3">Details for {selectedCustomer.name}</h5> */}
            <AdditionalInfo />
            {currentActions?.length > 0 && <SelectionBar />}
            <DataColumns />
          </>
        )}

      {/* Specific "Not Found" message if loading is done, error exists, and it matches the expected "not found" pattern */}
      {!contextLoading &&
        contextError &&
        typeof contextError === "string" &&
        contextError.includes(customerId) && (
          <div className="alert alert-warning">
            Could not find customer with ID: {customerId}
          </div>
        )}
    </>
  );
};

export default ProfilePage;
