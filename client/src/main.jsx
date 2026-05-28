import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeInit } from '../.flowbite-react/init';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeInit />
    <App />
  </StrictMode>,
);
