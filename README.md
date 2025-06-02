# FinTrackAI — Your Secure Financial Chat Assistant

FinTrackAI is a smart, secure, and interactive AI-powered assistant that helps users extract insights from their financial documents through natural language queries. Upload PDFs like bank statements, invoices, or salary slips, and chat with your data to uncover actionable insights — all while keeping your information **encrypted and confidential**.

> Built with React, Node.js, Firebase, Google Gemini API, and Tailored Encryption Mechanisms.

----
## 🚀 Features

### 🗨️ Chat Interface
- Create, rename, and delete multiple chat sessions.
- Real-time AI answers via [Gemini](https://deepmind.google/discover/blog/introducing-gemini/).
- Store and sync messages to Firebase.

### 📎 PDF Upload + Processing
- Upload PDF files (e.g. bank statements, invoices).
- Securely parsed and encrypted before backend processing.
- Extracted text passed to Gemini for insights.

### 🧠 AI Financial Insights
- Ask questions like:
  - "What’s my total expenditure this month?"
  - "Summarize my recent transactions"
  - "Are there any unusual expenses?"
- Get smart summaries and analytics on your data.

### 🔐 Data Security
- Files never stored as-is.
- Financial text is **hashed + encrypted** before backend processing.
- Decryption occurs only during Gemini processing.
- End-to-end data confidentiality assured.

### 📁 Chat Management
- Rename chats (e.g. “Jan 2024 Bank Summary”).
- Get AI-generated summaries via modal popup.
- Sort chats based on recent activity.

---

## 🧰 Tech Stack

| Layer | Tech Used |
|-------|-----------|
| **Frontend** | React, TailwindCSS, Heroicons |
| **Backend** | Node.js, Express |
| **AI** | Gemini API (Google Generative AI) |
| **Database** | Firebase Realtime DB & Firestore |
| **Storage/Security** | In-memory PDF parsing, `crypto`, AES Encryption |
-------------------------------------------------------------------------

## 🧪 Example Prompts

> After uploading a bank statement PDF:

- **"How much did I spend on food in March?"**
- **"Give me a summary of my monthly salary deposits"**
- **"Are there any duplicate transactions?"**
- **"Generate a spending report with insights"**
- **"What were the top 3 categories I spent on?"**


----

## Screenshots
<h4>Signup</h4>
<img src="https://github.com/user-attachments/assets/d8ba7bbc-744b-4543-9a6c-52ef0f803dec"  alt="Signup Screenshot">
<h4>Login</h4>
<img src="https://github.com/user-attachments/assets/684e27c0-36af-41ff-9355-fcad3a593ea6"  alt="Login Screenshot">
<h4>Home Page / Chat Dashboard</h4>
<img src="https://github.com/user-attachments/assets/9aec444f-e976-4e03-9872-4bfee3536452"  alt="Home Page Screenshot">
<h4>First Prompt</h4>
<img src="https://github.com/user-attachments/assets/19a56f73-725d-4097-966d-282ac630cf84"  alt="First Prompt Screenshot">
<h4>FinTrackAI Response</h4>
<img src="https://github.com/user-attachments/assets/9ef47596-3453-42a1-add5-c08c8538fc80"  alt="FinTrackAI Response Screenshot">
<h4>Continuation of Chats</h4>
<img src="https://github.com/user-attachments/assets/3d088592-045c-4c55-b1af-cf70ccbdbf7a"  alt="Chat Continuation Screenshot">
<h4>Chat Options</h4>
<img src="https://github.com/user-attachments/assets/2c5ed5e2-59b5-4152-9d8b-f35fc2588bb9"  alt="Chat Options Screenshot">
<h4>Summary of Chat</h4>
<img src="https://github.com/user-attachments/assets/c4d2e2ec-3d20-415d-8a8a-65eeaf8328b5"  alt="Chat Summary Screenshot">
<h4>Deleting a Chat / Reset Password</h4>
<img src="https://github.com/user-attachments/assets/01072e59-619f-48ce-9b09-13495955dd6c"  alt="Delete Chat or Reset Password Screenshot">
<h4>Firestore</h4>
<img src="https://github.com/user-attachments/assets/f82468e9-544b-4f17-bb92-f4070a12934e"  alt="Firestore Screenshot">
<h4>Example Statement used</h4>
<img src="https://github.com/user-attachments/assets/b9fff722-31f8-4ff8-b7d7-4257a8ccde46" alt ="Example img">

---

## Overview
<h3>How FinTrackAI Works?</h3> <br>
FinTrackAI allows users to securely upload financial documents (PDFs) such as bank statements or invoices, which are parsed and encrypted on the backend before being analyzed by Google's Gemini Pro AI model. Users can then chat naturally with the assistant to extract personalized insights like expense summaries, unusual transactions, or monthly reports. All chats and document data are stored securely using Firebase, and the system ensures end-to-end confidentiality with encryption and hashing. The frontend offers a smooth experience with resizable chat sidebar, real-time AI messaging, PDF preview, and features like renaming, deleting, and summarizing chat sessions.

----
## Disclaimer & Terms

**FinTrackAI does not provide financial or legal advice.**

- All data is processed securely and never stored in raw form.
- Use at your own risk — insights are AI-generated and may not be 100% accurate.
- Do not upload highly sensitive documents unless you're sure of the environment.
