import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly cfg;
    private readonly dataSource;
    constructor(cfg: ConfigService, dataSource: DataSource);
    validate(payload: any): Promise<{
        sub: any;
        tenantId: any;
        email: any;
        role: any;
        firstName: any;
        lastName: any;
    }>;
}
export {};
