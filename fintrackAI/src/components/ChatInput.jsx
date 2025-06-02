import React, { useState } from 'react';
import { PaperAirplaneIcon, PaperClipIcon } from '@heroicons/react/24/solid';
import API_BASE_URL from '../api/api';
import axios from 'axios';

export default function ChatInput({ uid, chatId, setMessages, onSendMessage }) {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);

  const handleFileAttach = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/pdf';
    fileInput.onchange = (event) => {
      const selectedFile = event.target.files[0];
      if (selectedFile && selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setMessage(selectedFile.name);
        console.log('Attached PDF:', {
          name: selectedFile.name,
          size: (selectedFile.size / 1024).toFixed(2) + ' KB',
          type: selectedFile.type,
        });
      } else {
        alert('Only PDF files are allowed.');
      }
    };
    fileInput.click();
  };

  const handleSendMessage = async () => {
    if ((!message.trim() && !file) || !chatId || !uid) return;
    let msg = message.trim();
    setMessage('');
    if (onSendMessage) {
      await onSendMessage({ text: msg, file });
    }
    if (document.activeElement && document.activeElement.tagName === 'TEXTAREA') {
      document.activeElement.value = '';
    }
    setFile(null);
  };

  return (
    <>
      {/* File Preview */}
      {file && (
        <div className="flex items-center w-30 ml-12 h-10 m-3 text-xs justify-between bg-white border border-gray-300 rounded px-4 shadow-sm">
          <span className="text-gray-700 truncate max-w-[80%]">{file.name}</span>
          <button
            onClick={() => {
              setFile(null);
              setMessage('');
            }}
            title="Remove file"
            className="text-red-500 hover:text-red-700 text-xl font-bold cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {/* Input and Buttons */}
      <div className="p-4 pt-2 bg-gray-100 border flex flex-col gap-2 lg:px-40">
        <div className="flex items-center gap-2">
          <button
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
            onClick={handleFileAttach}
            title="Attach PDF"
          >
            <PaperClipIcon className="w-6 h-6" />
          </button>

          <textarea
            placeholder="Ask Anything..."
            tagName="TEXTAREA"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            onInput={(e) => {
              e.target.style.height = '50px';
              e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
            }}
            className="flex-1 p-2 px-5 m-3 border rounded-2xl resize-none focus:outline-none custom-scrollbar"
            style={{ minHeight: '50px', maxHeight: '200px', overflowY: 'auto' }}
          />

          <button
            className="bg-[#455a64] text-white px-4 py-2 rounded hover:bg-[#263238] transition duration-300 cursor-pointer"
            onClick={handleSendMessage}
          >
            <PaperAirplaneIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </>
  );
}
