// components/SummaryModal.jsx
import React from 'react';

export default function SummaryModal({ summary, title, onClose }) {
    
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-[#263238] text-white p-6 rounded-lg max-w-xl w-full shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-6 text-white hover:text-red-400 text-3xl font-bold cursor-pointer"
        >
          ×
        </button>
        <h2 className="text-lg font-semibold mb-4 text-center">{title} Summary</h2>
        <hr className='mx-10 mb-4'/>
        <div className="text-l whitespace-pre-wrap max-h-[400px] overflow-y-auto text-justify">
          {summary}
        </div>
      </div>
    </div>
  );
}
