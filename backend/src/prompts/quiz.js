function buildQuizPrompt(sectionText, sectionName) {
  return `You are a comprehension coach. Read the section below and generate 2-3 multiple choice questions to test understanding.

Return a JSON array only — no extra text.
Each question must follow this exact shape:
{
  "question": "The question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctIndex": 0,
  "explanation": "Why this answer is correct, with reference to the text",
  "passageQuote": "The exact sentence from the text that supports the answer"
}

Rules:
- Questions must be answerable using only the section text
- Vary difficulty: 1 easy, 1 medium, 1 hard
- correctIndex is 0-based (0 = first option)
- Do not make trick questions

SECTION: ${sectionName}

TEXT:
${sectionText.slice(0, 5000)}`;
}

module.exports = { buildQuizPrompt };
