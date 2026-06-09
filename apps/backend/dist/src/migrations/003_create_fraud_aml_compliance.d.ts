import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class CreateFraudAmlCompliance1000000000003 implements MigrationInterface {
    name: string;
    up(qr: QueryRunner): Promise<void>;
    down(qr: QueryRunner): Promise<void>;
}
