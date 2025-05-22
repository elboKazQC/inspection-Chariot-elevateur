import React from 'react';
import { ThemeProvider, createTheme, responsiveFontSizes } from '@mui/material';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import InspectionForm from './components/InspectionForm';
import { CssBaseline } from '@mui/material';

const msalConfig = {
  auth: {
    clientId: 'YOUR_CLIENT_ID', // À remplacer avec votre Client ID Azure
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: window.location.origin,
  }
};

const msalInstance = new PublicClientApplication(msalConfig);

let theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});
theme = responsiveFontSizes(theme);

function App() {
  return (
    <MsalProvider instance={msalInstance}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <InspectionForm />
      </ThemeProvider>
    </MsalProvider>
  );
}

export default App;
