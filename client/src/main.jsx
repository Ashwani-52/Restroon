// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
// ─── Wake up Render backend immediately ─────
const wakeupBackend = () => {
  fetch(`${import.meta.env.VITE_API_URL}/ping`, {
    method     : 'GET',
    credentials: 'include'
  }).catch(() => {});  // silent — just waking it up
};
wakeupBackend();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
