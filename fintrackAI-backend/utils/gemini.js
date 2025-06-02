// backend/gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Generate response using Gemini model
async function getGeminiResponse(messages, newMsg) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // or "gemini-pro" / "gemini-1.5-pro"

        // Base instruction for the AI
        let basePrompt = `You are a professional in assessing bank statements to find insights and help users with their queries. This information is confidential, so do not fabricate any data. Focus on the last user query especially. You must answer that query using the rest as context. Do not mention this explicitly. Answer in proper detail and brief (bullets if needed). If ever the user greets or says anything else apart from finance related, ans it polietly but also respond that kindly stick Finance only as that is what you are made for.`;

        // If this is the first message, instruct the model to name the chat
        if (newMsg === 1) {
            basePrompt += ` Also, NAME this chat. This is important. Provide output like: 'The name of this chat is ------'. Then continue with the insights`;
        }

        // Add formatted context
        const fullPrompt = `${basePrompt}\nContext: ${JSON.stringify(messages, null, 2)}`;

        const result = await model.generateContent(fullPrompt);
        const response = result.response;
        const text = response.text();

        console.log(text);
        return text;
    } catch (err) {
        console.error("Error generating Gemini response:", err);
        throw err;
    }
}

const getGeminiChatSummary = async (messages) => {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // or "gemini-pro" / "gemini-1.5-pro"
    if (!messages || messages.length === 0) {
        return "No chat messages to summarize.";
    }

    try {

        const systemPrompt = `You are an AI summarizer. Summarize the following chat between the user and assistant in a concise paragraph. Include the main topics or discussions, without repeating the full dialogue.`;

        const chatHistory = messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');

        const prompt = `${systemPrompt}\n\n${chatHistory}`;
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        console.log(text);
        return text;
    }
    catch (err) {
        console.error("Error generating summary", err);
        throw err;
    }
};


export { getGeminiResponse, getGeminiChatSummary }

