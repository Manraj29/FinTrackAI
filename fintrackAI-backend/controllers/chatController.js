const { db } = require('../utils/firebase');
const { v4: uuidv4 } = require('uuid');
const { getGeminiResponse, getGeminiChatSummary } = require('../utils/gemini');
const extractPdfText = require('../utils/pdfParser'); // use pdf-parse
const { encryptText, decryptText } = require('../utils/encryption'); // AES-256


// Create a new chat
const createChat = async (req, res) => {
  try {
    const { uid, title } = req.body;
    const chatId = uuidv4();
    const chatRef = db.collection('users').doc(uid).collection('chats').doc(chatId);

    await chatRef.set({
      chatId,
      title,
      createdAt: new Date(),
      messages: [],
      pdfText: '',
      insights: {}
    });

    res.status(201).json({ success: true, chatId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create chat', details: err.message });
  }
};

// Get all chats for a user
const getAllChats = async (req, res) => {
  try {
    const { uid } = req.params;
    const chatsRef = db.collection('users').doc(uid).collection('chats');
    const snapshot = await chatsRef.orderBy('createdAt', 'desc').get();

    const chats = snapshot.docs.map(doc => doc.data());
    res.status(200).json(chats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chats', details: err.message });
  }
};

// Get a single chat
const getSingleChat = async (req, res) => {
  try {
    const { uid, chatId } = req.params;
    const chatRef = db.collection('users').doc(uid).collection('chats').doc(chatId);
    const doc = await chatRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.status(200).json(doc.data());
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chat', details: err.message });
  }
};

const saveMessageToChat = async (req, res) => {
  try {
    const { uid, chatId } = req.params;
    const { role, content } = req.body;
    const file = req.file;

    if (!role || !content) {
      return res.status(400).json({ error: 'Missing role or content in request body' });
    }

    const chatRef = db.collection('users').doc(uid).collection('chats').doc(chatId);
    const doc = await chatRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const existingData = doc.data();
    const timestamp = new Date().toISOString();

    let userMessage = { role, content, timestamp };
    let contextMessages = [];

    // Handle PDF upload and extraction
    if (file?.mimetype === 'application/pdf') {
      console.log('PDF detected, extracting text...');
      const rawText = await extractPdfText(file.buffer);
      const encryptedText = encryptText(rawText);

      // Save encrypted text inside chat document
      await chatRef.update({ pdfText: encryptedText });

      // Also save under pdfUploads subcollection
      await db.collection('users').doc(uid).collection('pdfUploads').doc(chatId).set({
        chatId,
        encryptedText,
        createdAt: new Date(),
      });

      userMessage.fileAttached = true;
      userMessage.fileType = 'pdf';
      userMessage.fileName = file.originalname;

      // Add system message context for this upload only once
      const pdfContextMessage = {
        role: 'system',
        content: "This is the content extracted from the uploaded PDF:\n" + rawText,
        timestamp: new Date().toISOString()
      };
      contextMessages.push(pdfContextMessage);
    }

    // Always get encrypted pdfText from the chat document (if exists)
    const latestChatDoc = await chatRef.get();
    const pdfEncrypted = latestChatDoc.data()?.pdfText;

    if (pdfEncrypted) {
      const pdfDecrypted = decryptText(pdfEncrypted);
      // Add system message with PDF content to every request (except file upload one)
      if (contextMessages.length === 0) { // only if not already adding it above
        contextMessages.push({
          role: 'system',
          content: "Here is the user's bank statement data to assist with queries:\n" + pdfDecrypted,
          timestamp: new Date().toISOString()
        });
      }
    }

    const updatedMessages = [...(existingData.messages || []), userMessage];
    // Put system context BEFORE user/assistant messages
    const messagesForGemini = [...contextMessages, ...updatedMessages];

    const newMsgFlag = updatedMessages.length === 1 ? 1 : 0;

    const geminiResponse = await getGeminiResponse(messagesForGemini, newMsgFlag);

    if (newMsgFlag === 1) {
      const match = geminiResponse.match(/The name of this chat is (.+?)(\.|\n|$)/);
      if (match && match[1]) {
        const newTitle = match[1].trim();
        await chatRef.update({ title: newTitle });
      }
    }

    const assistantMessage = {
      role: 'assistant',
      content: geminiResponse,
      timestamp: new Date().toISOString()
    };
    const finalMessages = [...updatedMessages, assistantMessage];

    await chatRef.update({ messages: finalMessages });

    res.status(200).json({ success: true, messages: finalMessages });

  } catch (err) {
    console.error('Error saving message:', err);
    res.status(500).json({ error: 'Failed to save message', details: err.message });
  }
};


// Upload PDF text (extracted text only, not file)
const uploadPdfText = async (req, res) => {
  try {
    const { uid, chatId } = req.body;
    const fileBuffer = req.file.buffer;

    const rawText = await extractPdfText(fileBuffer);
    const encryptedText = encryptText(rawText);

    await db.collection('pdfUploads').doc(chatId).set({
      uid,
      chatId,
      encryptedText,
      createdAt: new Date(),
    });

    res.status(200).json({ message: 'PDF processed and stored securely' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload PDF text', details: err.message });
  }
};

// Generate insights (placeholder for Gemini later)
const generateInsights = async (req, res) => {
  try {
    const { chatId } = req.body;
    const doc = await db.collection('pdfUploads').doc(chatId).get();
    if (!doc.exists) return res.status(404).json({ error: 'Not found' });

    const encrypted = doc.data().encryptedText;
    const isPdf = "This Bank statement is from a PDF file, ";
    const decrypted = decryptText(encrypted);
    const de = isPdf + decrypted;
    const insight = await getGeminiResponse(de); // your Gemini wrapper
    res.status(200).json({ insight });

  } catch (err) {
    res.status(500).json({ error: 'Failed to save insights', details: err.message });
  }
};

// Delete a chat
const deleteChat = async (req, res) => {
  try {
    const { uid, chatId } = req.params;

    const chatRef = db.collection('users').doc(uid).collection('chats').doc(chatId);
    await chatRef.delete();

    res.status(200).json({ success: true, message: 'Chat deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete chat', details: err.message });
  }
};

// Rename a chat
const renameChat = async (req, res) => {
  try {
    const { uid, chatId } = req.params;
    const { title } = req.body;

    const chatRef = db.collection('users').doc(uid).collection('chats').doc(chatId);
    const doc = await chatRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    await chatRef.update({ title });

    return res.status(200).json({ success: true, message: 'Chat renamed successfully' }); // ✅ important
  } catch (err) {
    console.error('Rename Chat Error:', err);
    return res.status(500).json({ error: 'Failed to rename chat', details: err.message });
  }
};

const getChatSummary = async (req, res) => {
  try {
    const { uid, chatId } = req.params;

    const chatRef = db.collection('users').doc(uid).collection('chats').doc(chatId);
    const doc = await chatRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const chatData = doc.data();

    if (!chatData.messages || chatData.messages.length === 0) {
      return res.status(400).json({ error: 'Chat has no messages to summarize' });
    }

    const summary = await getGeminiChatSummary(chatData.messages);

    res.status(200).json({ success: true, summary });
  } catch (err) {
    console.error('Summary Error:', err);
    res.status(500).json({ error: 'Failed to generate chat summary', details: err.message });
  }
};


module.exports = {
  createChat,
  getAllChats,
  getSingleChat,
  saveMessageToChat,
  uploadPdfText,
  generateInsights,
  deleteChat,
  renameChat,
  getChatSummary
};
