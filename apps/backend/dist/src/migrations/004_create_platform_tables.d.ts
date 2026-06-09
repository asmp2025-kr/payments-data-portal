import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class CreatePlatformTables1000000000004 implements MigrationInterface {
    name: string;
    up(qr: QueryRunner): Promise<void>;
    down(qr: QueryRunner): Promise<void>;
}
