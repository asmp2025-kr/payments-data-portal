import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchemeController } from './scheme.controller';
import { SchemeService } from './scheme.service';

@Module({ imports: [TypeOrmModule.forFeature([])], controllers: [SchemeController], providers: [SchemeService], exports: [SchemeService] })
export class SchemeModule {}
