const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// gemini-1.5-flash is fast and free-tier friendly
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function callGemini(prompt) {
  const result = await model.generateContent(prompt);
  return result.response.text();
}

module.exports = { callGemini };
