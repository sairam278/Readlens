export const SECTIONS = [
  "1. Introduction",
  "2. Background",
  "3. Model Architecture",
  "4. Why Self-Attention",
  "5. Training",
  "6. Results",
  "7. Conclusion",
];

export const SECTION_OBJECTIVES = [
  "Understand why existing sequence models fall short and what problem the Transformer solves.",
  "Learn the encoder-decoder pattern and how attention differs from recurrence.",
  "Understand how the Transformer is structured: encoder, decoder, attention layers, and feed-forward blocks.",
  "See why self-attention is more efficient and powerful than RNNs and convolutions for sequence tasks.",
  "Learn how the model is trained: dataset, optimizer, regularisation choices, and why they matter.",
  "Compare the Transformer's BLEU scores against prior models and understand what drove the improvement.",
  "Consolidate the key insights: what the Transformer changed and what it left open for future work.",
];

export const GOAL_PRESETS = [10, 15, 20, 30, 45, 60];

export const SIDEBAR_CONCEPTS = [
  { term: "Encoder-Decoder", def: "Encoder reads input → produces understanding. Decoder uses that to generate output." },
  { term: "Self-Attention",  def: "Each word looks at every other word to understand context and relationships." },
  { term: "Multi-Head",      def: "Multiple attention patterns run in parallel — each captures different relationships." },
];

export const KEY_SENTENCE = "Multi-Head Attention allows the model to jointly attend to information from different representation subspaces at different positions.";
