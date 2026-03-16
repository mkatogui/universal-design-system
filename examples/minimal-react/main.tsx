/**
 * Entry: import UDS styles first, then render the app.
 * This matches the recommended order for a React app using @mkatogui/uds-react.
 */
import '@mkatogui/uds-react/styles.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
