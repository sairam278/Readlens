function buildSimplifyPrompt(sentence, paragraphContext) {
  return `Rewrite the following sentence in plain English so a general audience can understand it easily.

Rules:
- Keep the same meaning — do not remove any facts
- Use simple, short words
- One sentence output only — no explanation, no quotes

CONTEXT (paragraph the sentence is from):
${paragraphContext}

SENTENCE TO SIMPLIFY:
${sentence}`;
}

module.exports = { buildSimplifyPrompt };
