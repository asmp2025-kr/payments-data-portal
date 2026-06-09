import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplianceController } from './compliance.controller';
import { ComplianceService } from './compliance.service';

@Module({ imports: [TypeOrmModule.forFeature([])], controllers: [ComplianceController], providers: [ComplianceService], exports: [ComplianceService] })
export class ComplianceModule {}
