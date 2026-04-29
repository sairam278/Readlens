export const ALL_CHALLENGES = [
  {
    concept: "Self-Attention",
    question: "What is the core idea behind the Transformer architecture?",
    options: [
      "It only uses recurrent layers to process sequences one step at a time",
      "It relies entirely on attention mechanisms — no recurrence, no convolutions",
      "It uses convolutional layers with self-attention as a supplement",
      "It combines LSTM with a novel attention mechanism for better accuracy",
    ],
    correct: 1,
    explanation: "The Transformer's breakthrough was removing all recurrence and convolution entirely, using only attention. This enables full parallelism during training.",
    passage: "\"We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.\"",
  },
  {
    concept: "Multi-Head Attention",
    question: "Why does the Transformer use multi-head attention instead of a single attention function?",
    options: [
      "It reduces the number of parameters required in the model",
      "It allows the model to attend to information from different representation subspaces simultaneously",
      "It speeds up training by limiting the attention window size",
      "It replaces positional encoding by learning sequence order",
    ],
    correct: 1,
    explanation: "Multi-head attention lets the model jointly attend to information from different representation subspaces at different positions — something a single head would average out.",
    passage: "\"Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions.\"",
  },
  {
    concept: "Positional Encoding",
    question: "What problem does positional encoding solve in the Transformer?",
    options: [
      "It prevents overfitting by adding noise to the input embeddings",
      "It compresses the input sequence to a fixed-length representation",
      "It injects information about token position since attention has no built-in order",
      "It normalizes the attention weights to sum to one",
    ],
    correct: 2,
    explanation: "Attention is permutation-invariant — it doesn't know the order of tokens. Positional encoding adds order information directly to the input embeddings.",
    passage: "\"Since our model contains no recurrence and no convolution, in order for the model to make use of the order of the sequence, we must inject some information about the relative or absolute position of the tokens.\"",
  },
];

export const CONCEPT_HINTS = {
  "Positional Encoding": "Hint: attention has no built-in sense of order — positional encoding adds it.",
  "Multi-Head Attention": "Hint: think about attending to multiple representation subspaces simultaneously.",
  "Self-Attention": "Hint: the key innovation was removing recurrence and convolutions entirely.",
};
