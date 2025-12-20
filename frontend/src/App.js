import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import NotificationPopup from './components/NotificationPopup';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ReportPage from './pages/ReportPage';
import BrowsePage from './pages/BrowsePage';
import MatchesPage from './pages/MatchesPage';
import MyReportsPage from './pages/MyReportsPage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />
              <NotificationPopup />
              <Box component="main" sx={{ flexGrow: 1 }}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/"
                  element={
                    <PrivateRoute>
                      <HomePage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/report"
                  element={
                    <PrivateRoute>
                      <ReportPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/browse"
                  element={
                    <PrivateRoute>
                      <BrowsePage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/matches"
                  element={
                    <PrivateRoute>
                      <MatchesPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/my-reports"
                  element={
                    <PrivateRoute>
                      <MyReportsPage />
                    </PrivateRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Box>
          </Box>
        </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
