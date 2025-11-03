import { NextRequest, NextResponse } from "next/server";
import puppeteerCore from "puppeteer-core";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { html } = await request.json();

    if (!html) {
      return NextResponse.json(
        { error: "HTML content is required" },
        { status: 400 }
      );
    }

    let browser;
    try {
      // Check if running in serverless environment (Vercel, AWS Lambda)
      const isServerless = true;
      //   process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

      const launchOptions: {
        args: string[];
        executablePath?: string;
        channel?: "chrome";
        headless: boolean;
      } = {
        args: [],
        headless: true,
      };

      if (isServerless) {
        // Use @sparticuz/chromium for serverless environments (Vercel, AWS Lambda)
        const chromiumModule = await import("@sparticuz/chromium");
        // chromium exports everything as default in ES modules
        const chromium = chromiumModule.default || chromiumModule;

        // executablePath is a function that returns a Promise
        launchOptions.executablePath = await chromium.executablePath();
        console.log("Chromium executable path:", launchOptions.executablePath);
        // Use chromium args and add additional serverless-safe args
        const chromiumArgs = chromium.args || [];
        launchOptions.args = [
          ...chromiumArgs,
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-software-rasterizer",
          "--disable-gpu",
          "--hide-scrollbars",
        ];

        // Ensure headless mode (chromium.headless can be true or "new")
        launchOptions.headless =
          chromium.headless === true || chromium.headless === "new";
      } else {
        // For local development, use Chrome channel (auto-detects Chrome installation)
        launchOptions.channel = "chrome";
        launchOptions.args = ["--no-sandbox", "--disable-setuid-sandbox"];
      }

      browser = await puppeteerCore.launch(launchOptions);

      const page = await browser.newPage();

      // Set the HTML content
      await page.setContent(html, { waitUntil: "networkidle0" });

      // Generate PDF
      const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "20px",
          right: "20px",
          bottom: "20px",
          left: "20px",
        },
      });

      await browser.close();

      // Return PDF as response
      return new NextResponse(pdf as unknown as BodyInit, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'attachment; filename="export.pdf"',
        },
      });
    } catch (error) {
      if (browser) {
        await browser.close();
      }
      throw error;
    }
  } catch (error) {
    console.error("PDF export error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate PDF",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
