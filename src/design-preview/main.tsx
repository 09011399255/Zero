// Dev-only entry for the design harness. Served at /design.html.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '../index.css';
import { DesignPreview } from './DesignPreview';
import { ToastProvider } from '../components/shared/Toast';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <DesignPreview />
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>
);
