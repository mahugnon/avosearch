import PDFDocument from "pdfkit";

export async function generateContractPdf(input: {
  title: string;
  body: string;
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(16).font("Helvetica-Bold").text(input.title, { align: "center" });
    doc.moveDown(1.5);
    doc.fontSize(9).font("Helvetica").fillColor("#444444");
    doc.text(
      "Document généré via AvoSearch — aide documentaire, ne constitue pas une consultation juridique.",
      { align: "center" }
    );
    doc.moveDown(2);
    doc.fillColor("#000000").fontSize(10).font("Helvetica").text(input.body, {
      align: "left",
      lineGap: 4,
    });

    doc.end();
  });
}
