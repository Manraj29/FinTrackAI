const express = require('express');
const router = express.Router();
const {
  createChat,
  getAllChats,
  saveMessageToChat,
  uploadPdfText,
  generateInsights,
  getSingleChat,
  deleteChat,
  renameChat,
  getChatSummary
} = require('../controllers/chatController');
const multer = require('multer');
const upload = multer();

// Route: Create a new chat
// POST /api/chats/
router.post('/', createChat);

// Route: Get a single chat by user and chat ID
// GET /api/chats/:uid/:chatId
router.get('/:uid/:chatId', getSingleChat);

// Route: Get a single chat summary by user and chat ID
// GET /api/chats/:uid/:chatId
router.get('/:uid/:chatId/summary', getChatSummary);


// Route: Save a new message to a chat
// POST /api/chats/:uid/:chatId/message
router.post('/:uid/:chatId/message', upload.single('file'), saveMessageToChat);

// Route: Upload PDF text to a chat
// POST /api/chats/:uid/:chatId/pdf
router.post('/:uid/:chatId/pdf', uploadPdfText);

// Route: Generate insights for a chat
// POST /api/chats/:uid/:chatId/insights
router.post('/:uid/:chatId/insights', generateInsights);

// Route: Delete a chat
// DELETE /api/chats/:uid/:chatId
router.delete('/:uid/:chatId', deleteChat);

// Route: Rename a chat
// PATCH /api/chats/:uid/:chatId
router.patch('/:uid/:chatId/rename', renameChat);

// Route: Get all chats for a specific user
// GET /api/chats/:uid
router.get('/:uid', getAllChats);

module.exports = router;
