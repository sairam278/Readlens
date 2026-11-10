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

export const SECTIONS_DATA = [
  {
    page: "Page 1 of 15",
    title: "1. Introduction",
    objective: "Understand why existing sequence models fall short and what problem the Transformer solves.",
    keySentence: "The Transformer is the first sequence transduction model relying entirely on self-attention without recurrence.",
    concepts: [
      { term: "Recurrent Constraint", def: "Processing tokens one by one prevents parallelization across words." },
      { term: "Sequential Bottleneck", def: "Long sequences cause gradient degradation and slow down training significantly." },
      { term: "Attention Mechanism", def: "Directly connects any word to any other word without intermediate recurrent steps." }
    ],
    paragraphs: [
      {
        text: "Recurrent neural networks, long short-term memory (LSTM), and gated recurrent neural networks have been firmly established as state of the art approaches in sequence modeling and transduction problems such as language modeling and machine translation. Prior models typically factor computation along the symbol positions of the input and output sequences.",
        highlightText: "factor computation along the symbol positions",
        highlightType: "simplify",
        marginTitle: "Sequential Constraint",
        marginContent: "RNNs process tokens one by one (step 1, then step 2, etc.). You cannot compute word 10 until word 9 is done. This prevents GPUs from running in parallel."
      },
      {
        text: "This inherently sequential nature precludes parallelization within training examples, which becomes critical at longer sequence lengths, as memory constraints limit batching across examples. Recent work has achieved significant improvements in computational efficiency through factorization tricks and conditional computation, yet the fundamental constraint remains.",
        highlightText: "memory constraints limit batching",
        highlightType: "analogy",
        marginTitle: "Single-File Analogy",
        marginContent: "Like people waiting in a single-file line at a bank teller. No matter how powerful the computer is, everyone must wait for the person in front of them."
      },
      {
        text: "In this work we propose the Transformer, a model architecture eschewing recurrence and instead relying entirely on an attention mechanism to draw global dependencies between input and output. The Transformer allows for significantly more parallelization and can reach a new state of the art in translation quality after being trained for as little as twelve hours on eight P100 GPUs.",
        highlightText: "trained for as little as twelve hours",
        highlightType: "deepdive",
        marginTitle: "Training Efficiency",
        marginContent: "By ditching sequential steps, all words are fed at once into the GPU tensor cores, slashing training times from weeks to hours."
      }
    ]
  },
  {
    page: "Page 2 of 15",
    title: "2. Background",
    objective: "Learn the encoder-decoder pattern and how attention differs from recurrence.",
    keySentence: "Self-attention reduces path length between distant signals to a constant O(1) operations.",
    concepts: [
      { term: "Path Length", def: "The number of steps a signal must travel between two distant words in a sequence." },
      { term: "ConvS2S / ByteNet", def: "Convolutional attempts to parallelize sequences that still suffered from O(n) distance growth." },
      { term: "Intra-Attention", def: "Attention applied within a single sequence to compute richer contextual representations." }
    ],
    paragraphs: [
      {
        text: "The goal of reducing sequential computation also forms the foundation of the Extended Neural GPU, ByteNet and ConvS2S, all of which use convolutional neural networks as basic building blocks, computing hidden representations in parallel for all input and output positions.",
        highlightText: "convolutional neural networks as basic building blocks",
        highlightType: "simplify",
        marginTitle: "Convolution Attempts",
        marginContent: "CNNs could run in parallel, but to connect two distant words, they had to stack many layers like a pyramid."
      },
      {
        text: "In these models, the number of operations required to relate signals from two arbitrary input or output positions grows in the distance between positions, linearly for ConvS2S and logarithmically for ByteNet. This makes it more difficult to learn dependencies between distant positions. In the Transformer this is reduced to a constant number of operations.",
        highlightText: "reduced to a constant number of operations",
        highlightType: "deepdive",
        marginTitle: "Constant O(1) Path",
        marginContent: "Any word can attend directly to any other word across the entire document in exactly 1 matrix multiplication step."
      },
      {
        text: "Self-attention, sometimes called intra-attention, is an attention mechanism relating different positions of a single sequence in order to compute a representation of the sequence. Self-attention has been used successfully in reading comprehension, abstractive summarization, textual entailment and learning task-independent sentence representations.",
        highlightText: "relating different positions of a single sequence",
        highlightType: "analogy",
        marginTitle: "Intra-Attention Analogy",
        marginContent: "When reading 'The bank approved the loan', the word 'bank' looks at 'loan' and instantly knows it means financial institution, not riverbank."
      }
    ]
  },
  {
    page: "Page 3 of 15",
    title: "3. Model Architecture",
    objective: "Understand how the Transformer is structured: encoder, decoder, attention layers, and feed-forward blocks.",
    keySentence: "Multi-Head Attention allows the model to jointly attend to information from different representation subspaces at different positions.",
    concepts: [
      { term: "Encoder-Decoder", def: "Encoder reads input → produces understanding. Decoder uses that to generate output." },
      { term: "Self-Attention", def: "Each word looks at every other word to understand context and relationships." },
      { term: "Multi-Head", def: "Multiple attention patterns run in parallel — each captures different relationships." }
    ],
    paragraphs: [
      {
        text: "Most competitive neural sequence transduction models have an encoder-decoder structure. Here, the encoder maps an input sequence of symbol representations (x₁, ..., xₙ) to a sequence of continuous representations z = (z₁, ..., zₙ). Given z, the decoder then generates an output sequence (y₁, ..., yₘ) of symbols one element at a time.",
        highlightText: "encoder-decoder structure",
        highlightType: "simplify",
        marginTitle: "Encoder-Decoder",
        marginContent: "Think of it like a translation machine. The encoder reads and understands the input (French). The decoder writes the output (English) using what the encoder understood."
      },
      {
        text: "The Transformer follows this overall architecture using stacked self-attention and point-wise, fully connected layers for both the encoder and decoder, shown in the left and right halves of Figure 1, respectively.",
        highlightText: "stacked self-attention and point-wise, fully connected layers",
        highlightType: "simplify",
        marginTitle: "Self-Attention Layers",
        marginContent: "Instead of reading words one by one, the Transformer looks at all words at once and figures out which ones relate to each other."
      },
      {
        text: "An attention function can be described as mapping a query and a set of key-value pairs to an output, where the query, keys, values, and output are all vectors. The output is computed as a weighted sum of the values, where the weight assigned to each value is computed by a compatibility function of the query with the corresponding key.",
        highlightText: "query and a set of key-value pairs",
        highlightType: "analogy",
        marginTitle: "Attention Analogy",
        marginContent: "Imagine searching YouTube: Query = your search terms, Keys = video titles and tags, Values = the actual video content you watch."
      },
      {
        text: "We call our particular attention mechanism Scaled Dot-Product Attention. The input consists of queries and keys of dimension dₖ, and values of dimension dᵥ. We compute the dot products of the query with all keys, divide each by √dₖ, and apply a softmax function to obtain the weights on the values.",
        highlightText: "divide each by √dₖ",
        highlightType: "deepdive",
        marginTitle: "Scaled Dot-Product Formula",
        marginContent: "Softmax((Q K^T) / √d_k) V. Dividing by √d_k counters vanishing gradients when d_k is large, ensuring efficient backpropagation."
      },
      {
        text: "Multi-Head Attention allows the model to jointly attend to information from different representation subspaces at different positions. With a single attention head, averaging inhibits this. Multiple heads enable the model to simultaneously focus on syntax, semantics, and reference.",
        highlightText: "jointly attend to information from different representation subspaces at different positions",
        highlightType: "analogy",
        marginTitle: "Multi-Head Ensemble",
        marginContent: "Like an ensemble of detectives: one looks for suspects (subjects), another looks for actions (verbs), another links pronouns to names."
      }
    ]
  },
  {
    page: "Page 5 of 15",
    title: "4. Why Self-Attention",
    objective: "See why self-attention is more efficient and powerful than RNNs and convolutions for sequence tasks.",
    keySentence: "Self-attention layers connect all positions with a constant O(1) sequential operations, maximizing GPU parallelization.",
    concepts: [
      { term: "Computational Complexity", def: "Operations required per layer; O(n² · d) for self-attention vs O(n · d²) for recurrence." },
      { term: "Parallel Execution", def: "Minimum sequential operations needed to process a full sequence." },
      { term: "Interpretability", def: "Visualizing attention weights reveals syntactic and semantic relationships directly." }
    ],
    paragraphs: [
      {
        text: "In this section we compare various aspects of self-attention layers to the recurrent and convolutional layers commonly used for mapping one variable-length sequence of symbol representations to another sequence of equal length. Three criteria guide our comparison: total complexity, parallelizability, and maximum path length.",
        highlightText: "Three criteria guide our comparison",
        highlightType: "simplify",
        marginTitle: "Three Criteria",
        marginContent: "1. Total math operations. 2. How much work runs in parallel. 3. How fast information travels from the first word to the last word."
      },
      {
        text: "A self-attention layer connects all positions with a constant number of sequentially executed operations, whereas a recurrent layer requires O(n) sequential operations. In terms of computational complexity, self-attention layers are faster than recurrent layers when the sequence length n is smaller than the representation dimensionality d.",
        highlightText: "faster than recurrent layers when the sequence length n is smaller than the representation dimensionality d",
        highlightType: "deepdive",
        marginTitle: "Complexity Advantage",
        marginContent: "When n = 50 and d = 512, self-attention does n²·d = 1.28M operations, while an RNN does n·d² = 13.1M operations—making self-attention 10x faster."
      },
      {
        text: "As an additional benefit, self-attention can produce more interpretable models. We inspect attention distributions from our models and present examples where individual attention heads clearly learn to perform tasks related to the syntactic and semantic structure of sentences.",
        highlightText: "individual attention heads clearly learn to perform tasks",
        highlightType: "analogy",
        marginTitle: "Grammar X-Ray",
        marginContent: "Attention maps act like an X-ray into the AI mind: you can see lines directly connecting pronouns ('it') to their antecedents ('street' vs 'animal')."
      }
    ]
  },
  {
    page: "Page 7 of 15",
    title: "5. Training",
    objective: "Learn how the model is trained: dataset, optimizer, regularisation choices, and why they matter.",
    keySentence: "A learning rate warmup with inverse square root decay stabilizes attention training across millions of steps.",
    concepts: [
      { term: "Byte-Pair Encoding", def: "Subword segmentation keeping vocab small while handling unknown words." },
      { term: "Learning Rate Warmup", def: "Ramping up learning rate early to prevent unstable gradient collapse." },
      { term: "Label Smoothing", def: "Discouraging extreme certainty on target tokens to boost general translation score." }
    ],
    paragraphs: [
      {
        text: "We trained on the standard WMT 2014 English-German dataset consisting of about 4.5 million sentence pairs. Sentences were encoded using byte-pair encoding, which has a shared source-target vocabulary of about 37000 tokens. For English-French, we used the significantly larger WMT 2014 English-French dataset consisting of 36 million sentences.",
        highlightText: "byte-pair encoding, which has a shared source-target vocabulary",
        highlightType: "simplify",
        marginTitle: "Byte-Pair Encoding (BPE)",
        marginContent: "Breaks words into common fragments like 'un-' + 'break' + '-able'. Solves typos and rare words without needing a dictionary of 1,000,000 words."
      },
      {
        text: "We used the Adam optimizer with β₁ = 0.9, β₂ = 0.98 and ε = 10⁻⁹. We varied the learning rate over the course of training according to a schedule with warmup: the rate increases linearly for the first 4000 warmup_steps, then decreases proportionally to the inverse square root of the step number.",
        highlightText: "increases linearly for the first 4000 warmup_steps",
        highlightType: "deepdive",
        marginTitle: "Warmup Schedule",
        marginContent: "lrate = d_model^(-0.5) · min(step^(-0.5), step · warmup^(-1.5)). Prevents early random gradients from destroying initial embeddings."
      },
      {
        text: "We employ three types of regularization during training: Residual Dropout applied to each sub-layer before addition and normalization, Attention Dropout applied to softmax sums, and Label Smoothing of value ε_ls = 0.1 which penalizes overconfidence.",
        highlightText: "Label Smoothing of value ε_ls = 0.1",
        highlightType: "analogy",
        marginTitle: "Label Smoothing Analogy",
        marginContent: "Instead of demanding 100% confidence on one word, the model is rewarded for giving 90% to the top answer and 10% spread across valid synonyms."
      }
    ]
  },
  {
    page: "Page 9 of 15",
    title: "6. Results",
    objective: "Compare the Transformer's BLEU scores against prior models and understand what drove the improvement.",
    keySentence: "The Transformer achieves state-of-the-art 28.4 BLEU while slashing training cost by more than an order of magnitude.",
    concepts: [
      { term: "BLEU Score", def: "Standard evaluation metric measuring n-gram overlap between machine translation and human reference." },
      { term: "FLOPs Efficiency", def: "Total floating-point operations needed to train to convergence." },
      { term: "English Constituency Parsing", def: "Evaluating grammar tree syntax prediction without task-specific tuning." }
    ],
    paragraphs: [
      {
        text: "On the WMT 2014 English-to-German translation task, the big transformer model establishes a new state-of-the-art BLEU score of 28.4, outperforming the existing best models, including ensembles, by more than 2.0 BLEU. On the English-to-French translation task, our big model achieves a BLEU score of 41.8.",
        highlightText: "outperforming the existing best models, including ensembles, by more than 2.0 BLEU",
        highlightType: "simplify",
        marginTitle: "Record BLEU Score",
        marginContent: "In translation research, gaining +0.5 BLEU is a big breakthrough. Gaining +2.0 BLEU while training in 3.5 days shocked the AI community."
      },
      {
        text: "The Transformer base model achieves 27.3 BLEU while requiring only 3.3 × 10¹⁸ FLOPs to train, compared to ByteNet (1.0 × 10¹⁹ FLOPs) and GNMT+RL (1.5 × 10²⁰ FLOPs). This represents more than an order of magnitude reduction in training cost.",
        highlightText: "order of magnitude reduction in training cost",
        highlightType: "deepdive",
        marginTitle: "10x–50x Compute Savings",
        marginContent: "GNMT used 1.5×10²⁰ FLOPs. Transformer used 3.3×10¹⁸ FLOPs. That is roughly 45x less energy and GPU cluster time."
      },
      {
        text: "To evaluate if the Transformer can generalize to other tasks, we performed experiments on English constituency parsing. With no task-specific tuning, the model achieved 91.3 F1 score, outperforming all previously reported models with the exception of the Recurrent Neural Network Grammar.",
        highlightText: "English constituency parsing",
        highlightType: "analogy",
        marginTitle: "Zero-Shot Structure",
        marginContent: "Even when trained on general text, attention heads naturally organized English grammar trees without being programmed with syntax rules."
      }
    ]
  },
  {
    page: "Page 12 of 15",
    title: "7. Conclusion",
    objective: "Consolidate the key insights: what the Transformer changed and what it left open for future work.",
    keySentence: "By replacing recurrence with multi-head self-attention, the Transformer became the foundation of modern generative AI.",
    concepts: [
      { term: "Pure Attention", def: "Ditching recurrent loops completely in favor of multi-head attention." },
      { term: "Scaling Laws", def: "Unlocking model size scaling from millions of parameters to hundreds of billions." },
      { term: "Multimodal Future", def: "Extending self-attention to images, audio, video, and code generation." }
    ],
    paragraphs: [
      {
        text: "In this work, we presented the Transformer, the first sequence transduction model based entirely on attention, replacing the recurrent layers most commonly used in encoder-decoder architectures with multi-headed self-attention.",
        highlightText: "replacing the recurrent layers most commonly used in encoder-decoder architectures with multi-headed self-attention",
        highlightType: "simplify",
        marginTitle: "The Paradigm Shift",
        marginContent: "This single design choice revolutionized AI, leading directly to BERT, GPT-4, Claude, Gemini, and modern large multimodal models."
      },
      {
        text: "For translation tasks, the Transformer can be trained significantly faster than architectures based on recurrent or convolutional layers. On both WMT 2014 English-to-German and WMT 2014 English-to-French translation tasks, we achieved a new state of the art.",
        highlightText: "achieved a new state of the art",
        highlightType: "deepdive",
        marginTitle: "Foundation for LLMs",
        marginContent: "Because computation could be split across tens of thousands of GPUs simultaneously, models could scale from 100M parameters to 1T+ parameters."
      },
      {
        text: "We are excited about the future of attention-based models and plan to apply them to other tasks. We plan to extend the Transformer to problems involving input and output modalities other than text, such as images, audio and video, and to investigate local, restricted attention mechanisms to efficiently handle large inputs.",
        highlightText: "modalities other than text, such as images, audio and video",
        highlightType: "analogy",
        marginTitle: "Vision & Audio Visionaries",
        marginContent: "The authors accurately predicted that the exact same attention equations would later power image generators, voice models, and video AI."
      }
    ]
  }
];

export const SIDEBAR_CONCEPTS = SECTIONS_DATA[2].concepts;
export const KEY_SENTENCE = SECTIONS_DATA[2].keySentence;
