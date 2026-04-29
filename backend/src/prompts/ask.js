function buildAskPrompt(question, visiblePageText) {
  return `You are a reading assistant. Answer the user's question using ONLY the text visible on the current page. Do not use outside knowledge.

Rules:
- If the answer is in the text, answer clearly and concisely (2-4 sentences)
- If the answer is not in the visible text, say: "I can't find that in the current page. Try scrolling to the relevant section."
- Do not make up information

VISIBLE PAGE TEXT:
${visiblePageText.slice(0, 4000)}

USER QUESTION:
${question}`;
}

module.exports = { buildAskPrompt };
