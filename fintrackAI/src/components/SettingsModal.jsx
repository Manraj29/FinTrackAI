import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../api/api';
import axios from 'axios';
import { auth } from '../firebase'; // path to your firebase.js
import { useAuth } from "../context/AuthContext";
import { reload, sendPasswordResetEmail } from 'firebase/auth';

export default function SettingsModal({ onClose, currentUser }) {
  const [chats, setChats] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [resetMsg, setResetMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchChats = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/chats/${currentUser.uid}`);
      setChats(res.data);
      if (res.data.length > 0) {
        setSelectedOption(res.data[0].chatId); // auto-select first chat
      }
    } catch (err) {
      console.error("Error fetching chats", err);
    }
  };

  useEffect(() => {
    if (currentUser) fetchChats();
    const user = localStorage.getItem("currentUser");
    if (!user) window.location.href = "/";
  }, []);

  const handleDelete = async () => {
    if (!selectedOption) return;
    if (!window.confirm("Are you sure? you want to delete this chat?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/chats/${currentUser.uid}/${selectedOption}`);
      setChats(prev => {
        const newChats = prev.filter(chat => chat.chatId !== selectedOption);
        if (newChats.length > 0) {
          setSelectedOption(newChats[0].chatId);
        } else {
          setSelectedOption('');
        }
        return newChats;
      });
      window.location.href = "/";
    } catch (err) {
      console.error("Failed to delete chat", err);
    }
  };

  const handlePasswordReset = async () => {
    setErrorMsg('');
    setResetMsg('');
    if (emailInput.trim() !== currentUser.email) {
      setErrorMsg("Email doesn't match your account.");
      return;
    }
    if (!window.confirm("Are you sure? you want to reset the password?")) return;
    try {
      await sendPasswordResetEmail(auth, emailInput.trim());
      setResetMsg('Password reset email sent successfully.');
      alert("You will be now logged out, Please login to continue.")
    } catch (err) {
      console.error("Error sending reset email:", err);
      setErrorMsg("Failed to send password reset email.");
    }
  };

  return (
    <div className="fixed inset-0 bg-opacity-50 z-50 flex justify-center items-center backdrop-blur-sm">
      <div className="bg-[#263238] p-6 rounded-lg shadow-xl w-[90%] max-w-md text-gray-900 dark:text-gray-200">
        <h2 className="text-xl font-semibold mb-4">Settings</h2>

        <div className="items-center justify-between mb-4">
          <label htmlFor="chatselect" className="font-medium">
            Choose Chat
          </label>
          <div className="flex items-center space-x-2">
            <select
              id="chatselect"
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 w-full"
            >
              {chats.map(chat => (
                <option key={chat.chatId} value={chat.chatId}>
                  {chat.title}
                </option>
              ))}
            </select>
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 cursor-pointer"
              disabled={chats.length === 0}
            >
              Delete
            </button>
          </div>
        </div>

        {/* forgot password */}
        <div className="mb-4">
          <label htmlFor="emailInput" className="font-medium block mb-1">
            Forgot Password
          </label>
          <input
            type="email"
            id="emailInput"
            placeholder="Enter your email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <button
            onClick={handlePasswordReset}
            className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 cursor-pointer"
          >
            Send Reset Link
          </button>
          {resetMsg && <p className="text-green-400 text-sm mt-2">{resetMsg}</p>}
          {errorMsg && <p className="text-red-400 text-sm mt-2">{errorMsg}</p>}
        </div>

        <div className="text-sm text-[#b35042] dark:text-white italic">
          More settings coming soon...
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#ff725e] text-white rounded hover:bg-[#b25042] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
