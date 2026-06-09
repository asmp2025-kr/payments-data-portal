import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { register as promRegistry } from 'prom-client';

@ApiTags('health')
@Controller()
export class HealthController {
  constructor(@InjectDataSource() private readonly db: DataSource) {}

  @Get('health')
  async liveness() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('health/ready')
  async readiness() {
    try {
      await this.db.query('SELECT 1');
      return { status: 'ready', db: 'connected' };
    } catch (e) {
      return { status: 'not_ready', db: 'disconnected' };
    }
  }

  @Get('metrics')
  async metrics(@Res() res: Response) {
    res.set('Content-Type', promRegistry.contentType);
    res.end(await promRegistry.metrics());
  }
}
