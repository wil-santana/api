import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { SeniorProvider } from './context/SeniorContext';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SeniorProvider>
      <App />
    </SeniorProvider>
  </React.StrictMode>
);
