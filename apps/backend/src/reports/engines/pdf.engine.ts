import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import puppeteer from 'puppeteer';

@Injectable()
export class PdfEngine {
  private readonly logger = new Logger(PdfEngine.name);

  constructor(private readonly cfg: ConfigService) {}

  async generate(url: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: 'new',
      executablePath: this.cfg.get('PUPPETEER_EXECUTABLE_PATH') || undefined,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1200, height: 800 });
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
      await page.waitForSelector('[data-report-ready]', { timeout: 30000 });

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
        displayHeaderFooter: true,
        headerTemplate: '<div style="font-size:8px;width:100%;text-align:center;color:#666">Payments Data Portal — Confidential</div>',
        footerTemplate: '<div style="font-size:8px;width:100%;text-align:center;color:#666">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
      });

      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }
}
