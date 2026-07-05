import PDFDocument from "pdfkit";

const INK = "#10141f";
const BLUE = "#2547e8";
const MUTED = "#6a7286";
const RULE = "#d8d3c4";

const DISCLAIMER =
  "Document généré via AvoSearch — aide documentaire, ne constitue pas une consultation juridique.";

export async function generateContractPdf(input: {
  title: string;
  body: string;
  /** Shown when the document was reviewed by a barrister. */
  reviewedBy?: string | null;
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 64, size: "A4", bufferPages: true });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const left = doc.page.margins.left;
    const right = doc.page.width - doc.page.margins.right;
    const contentWidth = right - left;

    // ---- Masthead: overlapping-disc mark + wordmark ----
    const markY = doc.y + 2;
    doc.circle(left + 5, markY + 5, 5).fill(INK);
    doc.circle(left + 12, markY + 5, 5).fill(BLUE);
    doc
      .font("Helvetica-Bold")
      .fontSize(13)
      .fillColor(INK)
      .text("AvoSearch", left + 24, markY);
    doc.moveDown(1.6);

    // ---- Title ----
    doc
      .font("Times-Bold")
      .fontSize(22)
      .fillColor(INK)
      .text(input.title, { align: "left" });

    // Reviewed badge / meta line
    doc.moveDown(0.4);
    if (input.reviewedBy) {
      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(BLUE)
        .text(`Revu par ${input.reviewedBy}`.toUpperCase(), { characterSpacing: 0.5 });
    }

    // Hairline rule
    doc.moveDown(0.6);
    const ruleY = doc.y;
    doc.moveTo(left, ruleY).lineTo(right, ruleY).lineWidth(1).strokeColor(RULE).stroke();
    doc.moveDown(1.2);

    // ---- Body (serif, comfortable spacing, justified) ----
    doc
      .font("Times-Roman")
      .fontSize(11)
      .fillColor(INK)
      .text(input.body, {
        align: "justify",
        lineGap: 5,
        paragraphGap: 6,
        width: contentWidth,
      });

    // ---- Footer on every page: disclaimer + page number ----
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      const footerY = doc.page.height - doc.page.margins.bottom + 24;
      doc
        .font("Helvetica-Oblique")
        .fontSize(7.5)
        .fillColor(MUTED)
        .text(DISCLAIMER, left, footerY, { width: contentWidth - 40, align: "left", lineBreak: false });
      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(MUTED)
        .text(`${i - range.start + 1} / ${range.count}`, right - 40, footerY, {
          width: 40,
          align: "right",
          lineBreak: false,
        });
    }

    doc.end();
  });
}
