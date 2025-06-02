import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import EmailVerifyPage from "./pages/EmailVerifyPage";
import ChatHomePage from "./pages/ChatHomePage";

function PrivateRoute({ children }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/" />;
  }

  if (!currentUser.emailVerified) {
    return <Navigate to="/verify-email" />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/verify-email" element={<EmailVerifyPage />} />
          <Route
            path="/chat"
            element={
              <PrivateRoute>
                <ChatHomePage />
              </PrivateRoute>
            }
          />
          <Route path="/chat/:chatId" element={
            <PrivateRoute>
              <ChatHomePage />
            </PrivateRoute>
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
