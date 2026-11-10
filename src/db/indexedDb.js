import Dexie from "dexie";

export const db = new Dexie("ReadLensDB");

db.version(1).stores({
  documents: "id, title, status, progress, lastReadAt",
  notes: "++id, docId, sectionIdx, updatedAt",
  marginAnnotations: "++id, docId, paragraphIdx, type, createdAt",
  readingState: "docId, currentSec, scrollY, lastActive"
});

// Seed default paper if database is fresh
export async function initLocalDatabase() {
  const count = await db.documents.count();
  if (count === 0) {
    await db.documents.add({
      id: "doc-attention-is-all-you-need",
      title: "Attention Is All You Need",
      authors: "Vaswani et al.",
      pages: 15,
      progress: 38,
      score: 78,
      status: "In Progress",
      diff: "Advanced",
      icon: "📄",
      createdAt: new Date().toISOString(),
      lastReadAt: new Date().toISOString(),
      sections: [
        "1. Introduction",
        "2. Background",
        "3. Model Architecture",
        "4. Why Self-Attention",
        "5. Training",
        "6. Results",
        "7. Conclusion"
      ]
    });
  }
}

// ── Document Operations ──
export async function getLocalDocuments() {
  await initLocalDatabase();
  return await db.documents.toArray();
}

export async function saveLocalDocument(doc) {
  const existing = await db.documents.get(doc.id);
  const now = new Date().toISOString();
  if (existing) {
    await db.documents.update(doc.id, { ...doc, lastReadAt: now });
  } else {
    await db.documents.add({
      ...doc,
      createdAt: now,
      lastReadAt: now,
      status: doc.status || "In Progress",
      progress: doc.progress || 0
    });
  }
}

// ── Margin Annotations (Tufte style) ──
export async function getMarginAnnotations(docId) {
  return await db.marginAnnotations.where("docId").equals(docId).toArray();
}

export async function saveMarginAnnotation(annotation) {
  return await db.marginAnnotations.add({
    ...annotation,
    createdAt: new Date().toISOString()
  });
}

export async function deleteMarginAnnotation(id) {
  return await db.marginAnnotations.delete(id);
}

// ── Notes Operations ──
export async function getDocNotes(docId) {
  return await db.notes.where("docId").equals(docId).toArray();
}

export async function saveDocNote(docId, text, sectionIdx = 0) {
  const existing = await db.notes.where({ docId, sectionIdx }).first();
  if (existing) {
    await db.notes.update(existing.id, { text, updatedAt: new Date().toISOString() });
  } else {
    await db.notes.add({ docId, sectionIdx, text, updatedAt: new Date().toISOString() });
  }
}
