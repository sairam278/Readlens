function buildDocumentMapPrompt(text) {
  return `You are an expert reading coach. Analyze the document below and return a JSON object only — no extra text.

The JSON must follow this exact shape:
{
  "summary": "One paragraph plain-English summary of the entire document",
  "sections": [
    { "title": "Section name", "description": "One-line description of what this section covers" }
  ],
  "keyTopics": ["topic1", "topic2", "topic3", "topic4", "topic5"],
  "difficulty": "Easy" | "Medium" | "Advanced"
}

Rules:
- summary: 3-5 sentences, no jargon, written for a general audience
- sections: list every major section or chapter found in the document
- keyTopics: 5-8 core concepts or themes
- difficulty: base this on vocabulary complexity and assumed background knowledge

DOCUMENT:
${text.slice(0, 12000)}`;
}

module.exports = { buildDocumentMapPrompt };
