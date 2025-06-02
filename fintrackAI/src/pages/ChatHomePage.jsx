import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import ChatInput from "../components/ChatInput";
import axios from "axios";
import API_BASE_URL from "../api/api.js";
import { useParams, useNavigate } from 'react-router-dom';
// import SummaryModal from '../components/SummaryModal.jsx';


export default function ChatHomePage() {
  const { logout, currentUser } = useAuth();
  const { chatId } = useParams(); // 🧭 Get chatId from URL
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  const [collapsed, setCollapsed] = useState(false);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatName, setChatName] = useState('');
  // const [summaryModalContent, setSummaryModalContent] = useState(null);

  // 📥 Fetch all chats
  const fetchChats = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/chats/${currentUser.uid}`);
      setChats(res.data);

      // ⏩ Auto-navigate to most recent if none selected
      // if (!chatId && res.data.length > 0) {
      //   navigate(`/chat/${res.data[0].chatId}`);
      // }
    } catch (err) {
      console.error("Error fetching chats", err);
    }
  };

  // 📬 Fetch messages for current chat
  const fetchMessages = async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/chats/${currentUser.uid}/${id}`);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error("Error fetching messages", err);
    }
  };

  // 🆕 Create a new chat
  const createNewChat = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/chats`, {
        uid: currentUser.uid,
        title: `New Chat ${new Date().toLocaleString()}`,
        // title: chatName,
      });
      fetchChats();
      setMessages([]);
      navigate(`/chat/${res.data.chatId}`);
    } catch (err) {
      console.error("Error creating chat", err);
    }
  };

  // 💬 Send a new message

  const handleSendMessage = async ({ text, file }) => {
    const userMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      file: null,
    };
    if (file) {
      userMessage.file = {
        name: file.name,
        url: URL.createObjectURL(file), // For local preview
        type: file.type
      };
    }
    console.log(userMessage);

    // Add a temporary loading assistant message
    const tempThinkingMsg = {
      role: "assistant",
      content: "FinTrackAI is thinking...",
      timestamp: new Date().toISOString(),
      thinking: true // 👈 flag to identify it
    };
    setMessages(prev => [...prev, userMessage, tempThinkingMsg]);

    try {
      // 2. Prepare FormData to send file + metadata
      const formData = new FormData();
      formData.append("role", userMessage.role);
      formData.append("content", userMessage.content);
      formData.append("timestamp", userMessage.timestamp);
      if (file) {
        formData.append("file", file); // 👈 send the file
      }

      // 3. Send POST request with FormData
      const res = await axios.post(
        `${API_BASE_URL}/chats/${currentUser.uid}/${chatId}/message`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // 4. Update with response
      setMessages(res.data.messages || []);
      await fetchChats();

    } catch (err) {
      console.error("Failed to send message with file:", err);
    }
  };

  const refreshChats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/chats/${currentUser.uid}`);
      setChats(response.data);
    } catch (error) {
      console.error('Error refreshing chats:', error);
    }
  };

  // 🔁 React to chatId changes in URL
  useEffect(() => {
    if (chatId) {
      setActiveChatId(chatId);
      fetchMessages(chatId);
    }
    // check from all chats if they dont contain any message then delete the chat
    const cleanEmptyChats = async () => {
      // get messages from all the chats and if any chat is empty delete the chat
      for (const chat of chats) {
        try {
          const res = await axios.get(`${API_BASE_URL}/chats/${currentUser.uid}/${chat.chatId}`);

          if (!res.data.messages || res.data.messages.length === 0) {
            await axios.delete(`${API_BASE_URL}/chats/${currentUser.uid}/${chat.chatId}`);
          }
        } catch (err) {
          console.error(`Error checking/deleting chat ${chat.chatId}:`, err);
        }
      }
    };

    cleanEmptyChats();
    refreshChats();
  }, [chatId]);

  // 📡 On first mount
  useEffect(() => {
    if (currentUser) fetchChats();

    const user = localStorage.getItem("currentUser");
    if (!user) window.location.href = "/";

    const handleResize = () => setCollapsed(window.innerWidth < 768);
    handleResize();
  }, []);

  // 🔐 Logout
  const handleLogout = async () => {
    if (!confirm(`Are you sure you want to Logout?`)) return;
    try {
      await logout();
      localStorage.removeItem("currentUser");
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // ⬅️ Handle chat selection
  const handleChatSelect = (id) => {
    navigate(`/chat/${id}`);
  };


  return (
    <div className="flex h-screen">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        chats={chats}
        onSelectChat={handleChatSelect}
        onNewChat={createNewChat}
        currentUser={currentUser}
        chatName={chatName}
        refreshChats={refreshChats}
      />

      <div className="flex flex-col flex-1 relative">
        {/* Top Bar */}
        <div className="flex justify-between items-center px-4 py-2 bg-gray-100 border-b">
          <button
            onClick={() => setCollapsed(false)}
            className={`text-gray-600 cursor-pointer text-2xl font-bold ${!collapsed ? "hidden" : "block"}`}
            title="Open Sidebar"
          >
            ☰
          </button>
          <h1 className={`text-xl font-semibold text-[#263238] ${window.innerWidth < 768 ? "hidden" : "block"}`}>
            Welcome, {currentUser?.email}
          </h1>
          <button
            className="bg-[#ad5a50] hover:bg-red-800 text-white px-4 py-2 rounded-3xl shadow-md cursor-pointer transition-all duration-300 text-sm"
            onClick={handleLogout}
            title="Logout"
          >
            Logout
          </button>
        </div>

        {/* Chat Area */}
        <ChatWindow
          messages={messages}
          setMessages={setMessages}
          chatId={chatId}
          uid={currentUser.uid}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          chatName={chatName}
          setChatName={setChatName}
        />

        <ChatInput
          uid={currentUser.uid}
          chatId={chatId}
          setMessages={setMessages}
          onSendMessage={handleSendMessage}
        />

        {/* {summaryModalContent && (
          <SummaryModal
            summary={summaryModalContent}
            title={"Loading"}
            onClose={() => setSummaryModalContent(null)}
          />
        )} */}
      </div>
    </div>
  );
}
