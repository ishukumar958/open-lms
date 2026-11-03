import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { Providers } from './app/providers';
import { router } from './app/router';

export default function App() {
  return (
    <Providers>
      <RouterProvider
        router={router}
        future={{ v7_startTransition: true }}
      />
    </Providers>
  );
}