// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import AddCustomerPage from './pages/AddCustomerPage'; // Import the new page
import Layout from './components/Layout';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
           {/* Routes using the shared Layout */}
           <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/profile/:customerId" element={<ProfilePage />} />
              <Route path="/add-customer" element={<AddCustomerPage />} /> {/* Add route for the new page */}
              {/* Add other routes within Layout as needed */}
              <Route path="*" element={<div>404 - Page Not Found</div>} /> {/* Catch-all within Layout */}
           </Route>
           {/* You could define routes outside the Layout here if needed */}
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;