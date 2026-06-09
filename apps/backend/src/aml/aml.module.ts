import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AmlController } from './aml.controller';
import { AmlService } from './aml.service';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [AmlController],
  providers: [AmlService],
  exports: [AmlService],
})
export class AmlModule {}
