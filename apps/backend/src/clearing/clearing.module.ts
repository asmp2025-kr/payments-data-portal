import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClearingController } from './clearing.controller';
import { ClearingService } from './clearing.service';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [ClearingController],
  providers: [ClearingService],
  exports: [ClearingService],
})
export class ClearingModule {}
