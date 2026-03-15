// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from './routes/ProtectedRoute.jsx';
import PublicRoute from './routes/PublicRoute.jsx';

import AuthToggle from './pages/AuthToggle.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Home from './pages/Home.jsx';
import URLScanner from './pages/URLScanner.jsx';
import URLDetails from './pages/URLDetails.jsx';
import IDSAnalyzer from './pages/IDSAnalyzer.jsx';
import IDSDetails from './pages/IDSDetails.jsx';
import LiveIDS from './pages/LiveIDS.jsx';
import FileScanner from './pages/FileScanner.jsx';
import FileDetails from './pages/FileDetails.jsx';
import RAGExplain from './pages/RAGExplain.jsx';
import Reports from './pages/Reports.jsx';
import Profile from './pages/Profile.jsx';

import Layout from './components/Layout.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';

// NEW: Global IDS watcher (alerts on ANY page)
import IDSGlobalWatcher from "./components/IDSGlobalWatcher.jsx";

const AuthFallbackRoute = () => {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
         <IDSGlobalWatcher />
        <Routes>

          {/* Public Home (full screen, no layout) */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />

          {/* Public Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<AuthToggle />} />
            <Route path="/register" element={<AuthToggle />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>

              <Route path="/dashboard" element={<Dashboard />} />

              {/* URL Scanner */}
              <Route path="/scanner" element={<URLScanner />} />
              <Route path="/scan/:scanId" element={<URLDetails />} />

              {/* IDS Analyzer */}
              <Route path="/ids" element={<IDSAnalyzer />} />

              {/* ⭐ Required Route — FIXED */}
              <Route path="/ids/details" element={<IDSDetails />} />

              {/* Optional scan/:id deep-link route */}
              <Route path="/ids/scan/:scanId" element={<IDSDetails />} />

              {/* 🔥 Live Real-Time IDS */}
              <Route path="/ids/live" element={<LiveIDS />} />


              {/* File Scanner */}
              <Route path="/filescan" element={<FileScanner />} />
              <Route path="/file/:id" element={<FileDetails />} />

              {/* RAG + Reports + Profile */}
              <Route path="/rag" element={<RAGExplain />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/profile" element={<Profile />} />

            </Route>
          </Route>

          {/* Fallback: guests -> login, authenticated -> dashboard */}
          <Route path="*" element={<AuthFallbackRoute />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
