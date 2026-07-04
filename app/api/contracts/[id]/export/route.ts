import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateContractPdf } from "@/lib/pdf/contract";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id || session.user.role === "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const contract = await prisma.contract.findUnique({
    where: { id },
    select: { title: true, extractedText: true, ownerId: true },
  });

  if (!contract || contract.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!contract.extractedText.trim()) {
    return NextResponse.json({ error: "Empty contract" }, { status: 400 });
  }

  const pdf = await generateContractPdf({
    title: contract.title,
    body: contract.extractedText,
  });

  const filename = `${contract.title.replace(/[^\w\s-]/g, "").slice(0, 80) || "contrat"}.pdf`;

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
