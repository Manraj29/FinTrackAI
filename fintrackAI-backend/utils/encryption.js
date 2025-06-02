// utils/encryption.js
const crypto = require('crypto');

const SECRET_KEY = process.env.PDF_ENCRYPTION_KEY;

if (!SECRET_KEY || SECRET_KEY.length !== 32) {
  throw new Error('PDF_ENCRYPTION_KEY must be set and be 32 bytes long for AES-256-CBC.');
}

function encryptText(text) {
  if (!text || typeof text !== 'string') {
    throw new TypeError('encryptText: text must be a non-empty string');
  }

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(SECRET_KEY), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decryptText(encryptedData) {
  const [ivHex, encryptedText] = encryptedData.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(SECRET_KEY), iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

module.exports = { encryptText, decryptText };
