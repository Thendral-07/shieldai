
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("ShieldAI Initialization Error:", error);
  rootElement.innerHTML = `<div style="color: white; padding: 20px; font-family: sans-serif;">
    <h1 style="color: #ef4444;">ShieldAI System Error</h1>
    <p>Critical failure during boot sequence. Check console for details.</p>
    <pre style="background: #1e293b; padding: 10px; border-radius: 5px;">${error}</pre>
  </div>`;
}
