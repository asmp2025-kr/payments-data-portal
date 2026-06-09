import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';

@Module({ imports: [TypeOrmModule.forFeature([])], controllers: [TenantsController], providers: [TenantsService], exports: [TenantsService] })
export class TenantsModule {}
