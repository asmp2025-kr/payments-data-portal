import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';

@Module({ imports: [TypeOrmModule.forFeature([])], controllers: [CardsController], providers: [CardsService], exports: [CardsService] })
export class CardsModule {}
