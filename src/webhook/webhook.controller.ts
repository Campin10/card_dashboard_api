import { Controller, Post, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { WebhookService } from './webhook.service';

@Controller('webhook')
@ApiTags('Webhook')
@ApiBearerAuth()
export class WebHookController {
  constructor(private metricsService: WebhookService) {}

  @Post()
  async webhookEvent(@Req() req: Request, @Res() res: Response): Promise<void> {
    return await this.metricsService.processNewEvent(req, res);
  }
}
