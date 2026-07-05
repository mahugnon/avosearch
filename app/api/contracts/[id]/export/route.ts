import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canDownloadContract } from "@/lib/contracts/export-access";
import { generateContractPdf } from "@/lib/pdf/contract";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id || session.user.role === "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const access = await canDownloadContract({
    contractId: id,
    userId: session.user.id,
    role: session.user.role,
  });

  if (!access.ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const pdf = await generateContractPdf({
    title: access.title,
    body: access.extractedText,
  });

  const filename = `${access.title.replace(/[^\w\s-]/g, "").slice(0, 80) || "contrat"}.pdf`;

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
