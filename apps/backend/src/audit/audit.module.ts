import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';

@Module({ imports: [TypeOrmModule.forFeature([])], controllers: [AuditController], providers: [AuditService] })
export class AuditModule {}
