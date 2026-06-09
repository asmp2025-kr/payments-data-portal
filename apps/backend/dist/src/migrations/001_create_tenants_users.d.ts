import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class CreateTenantsUsers1000000000001 implements MigrationInterface {
    name: string;
    up(qr: QueryRunner): Promise<void>;
    down(qr: QueryRunner): Promise<void>;
}
