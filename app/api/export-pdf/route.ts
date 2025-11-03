import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { html } = await req.json();
    if (!html) {
      return NextResponse.json({ error: "Missing HTML" }, { status: 400 });
    }

    // Force @sparticuz/chromium path
    const executablePath = await chromium.executablePath();
    console.log("Chromium path:", executablePath);

    const browser = await puppeteer.launch({
      ignoreDefaultArgs: ["--disable-extensions"],
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: executablePath || "/usr/bin/chromium-browser",
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
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
