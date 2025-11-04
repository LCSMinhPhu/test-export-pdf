import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { html } = await req.json();
    if (!html) {
      return NextResponse.json({ error: "Missing HTML" }, { status: 400 });
    }

    // Force @sparticuz/chromium path
    // const executablePath = await chromium.executablePath();
    const executablePath = await chromium.executablePath(
      "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar"
    );
    console.log("Chromium path:", executablePath);
    const browser = await puppeteer.launch({
      executablePath,
      // You can pass other configs as required
      args: chromium.args,
      headless: true,
      defaultViewport: { width: 1024, height: 1024 },
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();

    return new NextResponse(pdf as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="export.pdf"',
      },
    });
  } catch (err: any) {
    console.error("PDF export error:", err);
    return NextResponse.json(
      { error: "Failed to generate PDF", details: err.message || err },
      { status: 500 }
    );
  }
}
