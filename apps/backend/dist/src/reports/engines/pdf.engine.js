"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PdfEngine_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfEngine = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const puppeteer_1 = require("puppeteer");
let PdfEngine = PdfEngine_1 = class PdfEngine {
    constructor(cfg) {
        this.cfg = cfg;
        this.logger = new common_1.Logger(PdfEngine_1.name);
    }
    async generate(url) {
        const browser = await puppeteer_1.default.launch({
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
        }
        finally {
            await browser.close();
        }
    }
};
exports.PdfEngine = PdfEngine;
exports.PdfEngine = PdfEngine = PdfEngine_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PdfEngine);
//# sourceMappingURL=pdf.engine.js.map