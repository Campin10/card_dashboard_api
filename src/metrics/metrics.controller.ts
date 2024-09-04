import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MetricsService } from './metrics.service';
import { IMetrics } from './types/metrics.type';

@Controller('metrics')
@ApiTags('Metrics')
@ApiBearerAuth()
export class MetricsController {
  constructor(private metricsService: MetricsService) {}

  @Get('/:cardId')
  async getMetrics(@Param('cardId') cardId: string): Promise<IMetrics> {
    return await this.metricsService.getMetrics(cardId);
  }
}
