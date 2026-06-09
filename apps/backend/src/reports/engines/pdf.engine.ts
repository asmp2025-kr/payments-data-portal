import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PdfEngine {
  private readonly logger = new Logger(PdfEngine.name);

  constructor(private readonly cfg: ConfigService) {}

  async generate(_url: string): Promise<Buffer> {
    // Puppeteer is disabled in cloud deployment (DISABLE_PUPPETEER=true)
    // PDF generation returns a placeholder until Puppeteer is available
    this.logger.warn('PDF generation is disabled (DISABLE_PUPPETEER=true)');
    const placeholder = `PDF generation is disabled in this deployment.\nEnable by setting DISABLE_PUPPETEER=false and installing Chromium.`;
    return Buffer.from(placeholder, 'utf-8');
  }
}
