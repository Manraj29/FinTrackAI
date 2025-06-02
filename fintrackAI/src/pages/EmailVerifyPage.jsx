import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function EmailVerifyPage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
        try {
            await logout();
            localStorage.removeItem("currentUser"); // Clear user data from localStorage
            window.location.href = "/"; // Redirect to login page
        } catch (error) {
            console.error("Logout failed:", error);
        }
    }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      {/* Card */}
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full text-center">
        {/* Logo */}
        {/* <div className="flex justify-center mb-6">
          <img src={logo} alt="Logo" className="w-16 h-16" />
        </div> */}

        {/* Heading */}
        <h1 className="text-2xl font-semibold text-blue-600 mb-2">Email Verification Required</h1>
        <p className="text-gray-600 mb-4">
          Please check your inbox and verify your email to access your dashboard.
        </p>

        {/* Email */}
        {currentUser?.email && (
          <div className="text-gray-800 font-medium mb-6">
            Email: <span className="text-blue-600">{currentUser.email}</span>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 transition text-white px-6 py-2 rounded-md shadow-md"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
