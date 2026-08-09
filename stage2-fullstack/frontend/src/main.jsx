import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import axios from 'axios';
// Dynamically target backend URL (production Render URL or local development proxy)
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
