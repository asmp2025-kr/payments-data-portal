import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class CreatePaymentDomain1000000000002 implements MigrationInterface {
    name: string;
    up(qr: QueryRunner): Promise<void>;
    down(qr: QueryRunner): Promise<void>;
}
