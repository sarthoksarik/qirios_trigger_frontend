// src/main.jsx (or src/index.js)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import 'bootstrap/dist/css/bootstrap.min.css'; // Your CSS import
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // <-- ADD THIS LINE
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);