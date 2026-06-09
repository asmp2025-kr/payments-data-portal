import { Response } from 'express';
import { DataSource } from 'typeorm';
export declare class HealthController {
    private readonly db;
    constructor(db: DataSource);
    liveness(): Promise<{
        status: string;
        timestamp: string;
    }>;
    readiness(): Promise<{
        status: string;
        db: string;
    }>;
    metrics(res: Response): Promise<void>;
}
