function buildKeyHighlightsPrompt(sectionText, pageNumber) {
  return `You are a reading coach. From the text below (page ${pageNumber}), identify the most important sentences — the top 20% that carry the core meaning.

Return a JSON array of the exact sentences to highlight. No extra text.
Example: ["Sentence one.", "Sentence two."]

Rules:
- Pick 3-6 sentences maximum
- Choose sentences that contain key definitions, conclusions, or critical facts
- Do NOT pick transitional or filler sentences

TEXT:
${sectionText.slice(0, 4000)}`;
}

module.exports = { buildKeyHighlightsPrompt };
