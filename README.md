# PDF Export Test App

A simple Next.js application for exporting HTML content to PDF using Puppeteer, designed to work on Vercel/serverless environments.

## Features

- Export HTML content to PDF
- Simple UI with HTML textarea input
- Works on Vercel/serverless with `chrome-aws-lambda`
- Download PDF files directly from the browser

## Tech Stack

- **Next.js 14** - React framework with App Router
- **puppeteer-core** - Headless Chrome automation
- **@sparticuz/chromium** - Chrome binary for serverless environments

## Setup

1. Install dependencies:

```bash
npm install
```

2. Run development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Enter or edit HTML content in the textarea
2. Click "Export PDF" button
3. The PDF will be generated and downloaded automatically

## Deploy to Vercel

1. Push your code to a Git repository
2. Import the project in Vercel
3. Vercel will automatically detect Next.js and deploy

The app is configured to work with Vercel's serverless functions using `@sparticuz/chromium` for Chrome binary support.

## API Endpoint

POST `/api/export-pdf`

**Request Body:**
```json
{
  "html": "<html>...</html>"
}
```

**Response:**
- Success: PDF file (application/pdf)
- Error: JSON with error message

## Project Structure

```
/app
  /api
    /export-pdf
      route.ts       # PDF export API endpoint
  page.tsx           # Main test page
  layout.tsx         # Root layout
```
