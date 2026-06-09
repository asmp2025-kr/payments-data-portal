import { ConfigService } from '@nestjs/config';
export declare class PdfEngine {
    private readonly cfg;
    private readonly logger;
    constructor(cfg: ConfigService);
    generate(url: string): Promise<Buffer>;
}
