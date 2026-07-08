import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { queryClient } from './app/queryClient';
import { AuthProvider } from './features/auth/components/AuthProvider';
import { appRoutes } from './routes/appRoutes';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={appRoutes} />
        <Toaster 
          theme="dark" 
          position="top-right" 
          closeButton 
          richColors
          toastOptions={{
            style: {
              background: '#18181b', // zinc-900 matching UI design
              border: '1px solid #27272a', // zinc-800
              color: '#fafafa', // zinc-50
            },
          }}
        />
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
