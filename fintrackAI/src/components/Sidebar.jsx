import React, { useState, useRef, useEffect } from 'react';
import SettingsModal from './SettingsModal';
import API_BASE_URL from '../api/api';
import axios from 'axios';
import SummaryModal from './SummaryModal';


export default function Sidebar({ collapsed, setCollapsed, chats, onSelectChat, onNewChat, currentUser, refreshChats }) {
  const [width, setWidth] = useState(260);
  const [internalCollapsed, setInternalCollapsed] = useState(collapsed);
  const [showSettings, setShowSettings] = useState(false);
  const sidebarRef = useRef(null);
  const isResizing = useRef(false);
  const [activeOptionsChatId, setActiveOptionsChatId] = useState(null);
  const [summaryModalContent, setSummaryModalContent] = useState(null);
  const [title, setTitle] = useState('');

  // Sync internal collapsed state with prop
  useEffect(() => {
    setInternalCollapsed(collapsed);
  }, [collapsed]);

  // Mouse events for resizing sidebar
  const startResize = () => {
    isResizing.current = true;
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', stopResize);
  };

  const handleResize = (e) => {
    if (!isResizing.current) return;
    // Clamp width between 180 and 400
    const newWidth = Math.min(Math.max(e.clientX, 180), 400);
    setWidth(newWidth);
  };

  const stopResize = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', stopResize);
  };

  useEffect(() => {
    return () => stopResize();
  }, []);

  // Collapse sidebar toggle
  const handleCollapseToggle = () => {
    setCollapsed(!internalCollapsed);
  };

  const handleRenameChat = async (chatId) => {
    const newTitle = prompt("Enter a new name for this chat:");

    if (!newTitle || newTitle.trim() === "") {
      alert("Chat name cannot be empty.");
      return;
    }

    try {
      const response = await axios.patch(
        `${API_BASE_URL}/chats/${currentUser.uid}/${chatId}/rename`,
        { title: newTitle }
      );

      alert('Chat renamed successfully');
      refreshChats();
    } catch (error) {
      console.error('Rename Error:', error);
      alert('Error renaming chat: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDeleteChat = async (chatId) => {
    try {
      await axios.delete(`${API_BASE_URL}/chats/${currentUser.uid}/${chatId}`);
      alert('Chat' + chatId + ' Deleted')
      window.location.href = "/";
    } catch (err) {
      console.error("Failed to delete chat", err);
    }
  }

  const getSummary = async (chatId) => {
    setSummaryModalContent("Loading summary...");
    await new Promise(resolve => setTimeout(resolve, 1300));
    try {
      const res = await axios.get(`${API_BASE_URL}/chats/${currentUser.uid}/${chatId}/summary`);
      const summary = res.data?.summary;

      if (summary) {
        setSummaryModalContent(summary);
      } else {
        alert("No summary could be generated.");
      }
    } catch (error) {
      console.error("Summary Error:", error);
      alert("Failed to get summary: " + (error.response?.data?.error || error.message));
    }
  };

  // Helper to get the latest message timestamp for a chat
  const getLastMessageTimestamp = (chat) => {
    if (!chat.messages || chat.messages.length === 0) return 0;
    // Find the max timestamp among messages in this chat
    return Math.max(...chat.messages.map(msg => new Date(msg.timestamp).getTime()));
  };

  const sortedChats = [...chats].sort((a, b) => {
    return getLastMessageTimestamp(b) - getLastMessageTimestamp(a);
  });

  return (
    <>
      <div
        ref={sidebarRef}
        className={`h-full bg-[#263238] text-white flex flex-col relative transition-all duration-300 ease-in-out overflow-hidden`}
        style={{
          width: internalCollapsed ? 0 : width,
          minWidth: internalCollapsed ? 0 : '180px',
        }}
      >
        {/* Top bar */}
        <div className="p-4 flex justify-between items-center border-b border-gray-700">
          <span className="text-lg font-semibold">FinTrackAI</span>
          <button
            onClick={handleCollapseToggle}
            className="text-gray-400 hover:text-white text-3xl font-bold transition duration-300 cursor-pointer"
            title={internalCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {internalCollapsed ? '☰' : '×'}
          </button>
        </div>

        <button
          className="bg-[#ff725e] m-4 py-2 px-4 rounded hover:bg-[#b35042] transition duration-300 text-white text-sm cursor-pointer"
          onClick={onNewChat}
        >
          + New Chat
        </button>

        <div className="flex-1 overflow-y-auto px-4">
          {sortedChats && sortedChats.length > 0 ? (
            <ul>
              {sortedChats.map((chat) => (
                <li
                  key={chat.chatId}
                  className="relative group cursor-pointer py-2 px-3 mb-2 hover:bg-gray-700 rounded flex items-center justify-between"
                  onClick={() => onSelectChat(chat.chatId)}
                // onMouseLeave={window.innerWidth < 768 ? '' : setActiveOptionsChatId(null)}
                >
                  <span className={`flex-1 ${chat.title.length >= 50 ? 'truncate' : ''} text-sm`} title={`Created on ${new Date(chat.createdAt._seconds * 1000).toLocaleString()}`}>
                    {chat.title}
                  </span>
                  {/* Options button, visible on hover */}
                  <button
                    className="ml-2 sm:opacity-100 transition-opacity px-2 py-1 rounded hover:bg-gray-600 cursor-pointer"
                    onClick={e => {
                      e.stopPropagation();
                      setActiveOptionsChatId(chat.chatId === activeOptionsChatId ? null : chat.chatId);
                      if (chat.chatId !== activeOptionsChatId) setTitle(chat.title);
                    }}
                    tabIndex={-1}
                  >
                    {activeOptionsChatId === chat.chatId ? '×' : '⋮'}
                  </button>
                  {/* Dropdown menu */}
                  {activeOptionsChatId === chat.chatId && (
                    <div className="absolute left-15 top-20 -translate-y-1/2 bg-gray-800 text-white rounded shadow-lg z-20 min-w-[100px]">
                      <button
                        className="block w-full text-left px-4 py-2 hover:bg-gray-700 cursor-pointer"
                        onClick={() => {
                          setActiveOptionsChatId(null);
                          handleRenameChat(chat.chatId);
                        }}
                      >
                        Rename
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2 hover:bg-gray-700 text-white cursor-pointer"
                        onClick={() => {
                          setActiveOptionsChatId(null);
                          getSummary(chat.chatId);
                        }}
                      >
                        Summary
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2 hover:bg-gray-700 text-red-400 cursor-pointer"
                        onClick={() => {
                          setActiveOptionsChatId(null);
                          // You should implement handleDeleteChat
                          if (window.confirm("Delete this chat?")) handleDeleteChat(chat.chatId);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="m-2 text-gray-400">No chats to display</p>
          )}
        </div>
        {summaryModalContent && (
          <SummaryModal
            summary={summaryModalContent}
            title={title}
            onClose={() => setSummaryModalContent(null)}
          />
        )}

        {/* Settings Button */}
        < div className="p-4 border-t border-gray-700" >
          <button
            onClick={() => setShowSettings(true)}
            className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 rounded text-sm cursor-pointer"
          >
            ⚙ Settings
          </button>
        </div >

        {/* Resize handle */}
        {
          !internalCollapsed && (
            <div
              className="absolute top-0 right-0 h-full w-1 cursor-ew-resize z-10"
              onMouseDown={startResize}
            />
          )
        }
      </div >

      {/* Settings Modal */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} currentUser={currentUser} />}
    </>
  );
}
