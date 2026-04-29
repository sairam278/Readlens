const { supabase } = require("../db/supabase");

const BUCKET = "documents";

async function uploadPDF(userId, fileBuffer, originalName) {
  const fileName = `${userId}/${Date.now()}_${originalName}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, fileBuffer, { contentType: "application/pdf" });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  return data.path; // file key stored in documents table
}

async function deletePDF(fileKey) {
  const { error } = await supabase.storage.from(BUCKET).remove([fileKey]);
  if (error) throw new Error(`Storage delete failed: ${error.message}`);
}

module.exports = { uploadPDF, deletePDF };
