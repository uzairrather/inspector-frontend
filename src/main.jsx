import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './i18n';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(() => {
        console.log('✅ Service Worker Registered');
      })
      .catch((err) => {
        console.error('❌ Service Worker Registration Failed:', err);
      });
  });
}

// ✅ Mount React App (NO BrowserRouter here)
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastContainer position="top-center" autoClose={3000} theme="colored" />
    <App />
  </React.StrictMode>
);
