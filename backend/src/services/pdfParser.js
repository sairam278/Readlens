const pdfParse = require("pdf-parse");

async function extractTextFromPDF(buffer) {
  const data = await pdfParse(buffer);

  if (!data.text || data.text.trim().length < 50) {
    throw new Error(
      "This PDF appears to be scanned. Only text-based PDFs are supported."
    );
  }

  return {
    text: data.text,
    pageCount: data.numpages,
  };
}

module.exports = { extractTextFromPDF };
