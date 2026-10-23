import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './app/App';
import './styles.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('The app root element is missing.');
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, retry: 0, refetchOnWindowFocus: false } }
});
createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <App />
      </HashRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
