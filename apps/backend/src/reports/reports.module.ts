import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { PdfEngine } from './engines/pdf.engine';
import { ExcelEngine } from './engines/excel.engine';
import { CsvEngine } from './engines/csv.engine';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [ReportsController],
  providers: [ReportsService, PdfEngine, ExcelEngine, CsvEngine],
  exports: [ReportsService],
})
export class ReportsModule {}
