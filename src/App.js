import React, { useState } from "react";
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
// routes
import Router from './routes';
// theme
import ThemeProvider from './theme';
// components
import { StyledChart } from './components/chart';
import ScrollToTop from './components/scroll-to-top';
import { AppContext } from "./lib/contextLib";
// ----------------------------------------------------------------------

export default function App() { 
  const [isAuthenticated, userHasAuthenticated] = useState(false);
  return (
    <HelmetProvider>
      <BrowserRouter>
        <ThemeProvider>
          <ScrollToTop />
          <StyledChart />
          <AppContext.Provider value={{ isAuthenticated, userHasAuthenticated }}>
            <Router />
          </AppContext.Provider>
        </ThemeProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}
