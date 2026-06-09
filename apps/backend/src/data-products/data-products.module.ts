import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataProductsController } from './data-products.controller';
import { DataProductsService } from './data-products.service';

@Module({ imports: [TypeOrmModule.forFeature([])], controllers: [DataProductsController], providers: [DataProductsService], exports: [DataProductsService] })
export class DataProductsModule {}
