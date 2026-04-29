const express      = require("express");
const multer       = require("multer");
const { supabase } = require("../db/supabase");
const { extractTextFromPDF }           = require("../services/pdfParser");
const { uploadPDF, deletePDF }         = require("../services/supabaseStorage");
const { callGemini }                   = require("../services/gemini");
const { buildDocumentMapPrompt }       = require("../prompts/documentMap");
const { buildKeyHighlightsPrompt }     = require("../prompts/keyHighlights");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

// POST /api/documents/upload
router.post("/upload", upload.single("pdf"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No PDF file uploaded." });

    const { text, pageCount } = await extractTextFromPDF(req.file.buffer);
    const fileKey = await uploadPDF(req.user.userId, req.file.buffer, req.file.originalname);

    const { data: doc, error } = await supabase
      .from("documents")
      .insert({
        user_id:    req.user.userId,
        name:       req.file.originalname,
        size:       req.file.size,
        page_count: pageCount,
        file_key:   fileKey,
        status:     "processing",
      })
      .select("id")
      .single();

    if (error) throw error;

    res.status(202).json({ message: "Upload received. Processing started.", documentId: doc.id });

    runAIPipeline(doc.id, text).catch((err) =>
      console.error(`AI pipeline failed for doc ${doc.id}:`, err.message)
    );
  } catch (err) {
    next(err);
  }
});

async function runAIPipeline(docId, fullText) {
  try {
    // 1. Generate document map
    const mapRaw = await callGemini(buildDocumentMapPrompt(fullText));
    const map    = JSON.parse(mapRaw);

    const { error: updateErr } = await supabase
      .from("documents")
      .update({
        summary:         map.summary,
        sections_json:   map.sections,
        key_topics_json: map.keyTopics,
        difficulty_score: map.difficulty,
        status:          "ready",
      })
      .eq("id", docId);

    if (updateErr) throw updateErr;

    // 2. Identify key sentences page by page
    const chunks = splitIntoChunks(fullText, 3000);
    for (let i = 0; i < Math.min(chunks.length, 10); i++) {
      try {
        const raw       = await callGemini(buildKeyHighlightsPrompt(chunks[i], i + 1));
        const sentences = JSON.parse(raw);
        const rows = sentences.map((sentence_text, j) => ({
          document_id:    docId,
          page_number:    i + 1,
          sentence_index: j,
          sentence_text,
        }));
        await supabase.from("key_sentences").insert(rows);
      } catch {
        // Skip chunk if Gemini returns malformed JSON
      }
    }
  } catch (err) {
    await supabase.from("documents").update({ status: "error" }).eq("id", docId);
    throw err;
  }
}

function splitIntoChunks(text, chunkSize) {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize)
    chunks.push(text.slice(i, i + chunkSize));
  return chunks;
}

// GET /api/documents
router.get("/", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("documents")
      .select("id, name, size, page_count, difficulty_score, status, created_at")
      .eq("user_id", req.user.userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/documents/:id/map
router.get("/:id/map", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("documents")
      .select("id, name, summary, sections_json, key_topics_json, difficulty_score, status, page_count")
      .eq("id", req.params.id)
      .eq("user_id", req.user.userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Document not found." });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/documents/:id/highlights
router.get("/:id/highlights", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("key_sentences")
      .select("page_number, sentence_index, sentence_text")
      .eq("document_id", req.params.id)
      .order("page_number");

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/documents/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("documents")
      .select("file_key")
      .eq("id", req.params.id)
      .eq("user_id", req.user.userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Document not found." });

    await deletePDF(data.file_key);

    await supabase.from("documents").delete().eq("id", req.params.id);
    res.json({ message: "Document deleted." });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
