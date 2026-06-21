import chromium from "@sparticuz/chromium";
import puppeteerCore from "puppeteer-core";

export async function generatePDFFromHtml(html: string): Promise<Buffer> {
  const executablePath = await chromium.executablePath();

  const browser = await puppeteerCore.launch({
    args: chromium.args,
    defaultViewport: { width: 1240, height: 1754 },
    executablePath,
    headless: true,
  });

  try {
    const page = await browser.newPage();

    // Setear viewport A4
    await page.setViewport({ width: 1240, height: 1754 });

    await page.setContent(html, {
      waitUntil: "load",
      timeout: 30000,
    });

    // Esperar que las fuentes de Google carguen
    await page.evaluateHandle("document.fonts.ready");

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
      preferCSSPageSize: false,
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
