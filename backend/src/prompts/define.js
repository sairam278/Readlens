function buildDefinePrompt(word, sentence) {
  return `Define the word "${word}" as it is used in the sentence below.

Rules:
- One sentence definition only
- Plain English — no dictionary jargon
- Tailor the definition to the context of the sentence

SENTENCE:
${sentence}`;
}

module.exports = { buildDefinePrompt };
