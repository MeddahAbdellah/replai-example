import pdfParse from "pdf-parse";
import fs from "fs";

export async function fetchCv() {
  let dataBuffer = fs.readFileSync("./cv_ds.pdf");
  const rag = await pdfParse(dataBuffer);
  return rag.text;
}
