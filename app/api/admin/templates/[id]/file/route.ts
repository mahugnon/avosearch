import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { storage } from "@/lib/storage";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const template = await prisma.contractTemplate.findUnique({
    where: { id },
    select: { fileKey: true, fileName: true, mimeType: true },
  });

  if (!template?.fileKey) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const buffer = await storage.read(template.fileKey);
    const fileName = template.fileName ?? "template";

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": template.mimeType ?? "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileName.replace(/"/g, "")}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
