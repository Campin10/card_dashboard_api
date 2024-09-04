import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CardService } from './card.service';
import { Card, CardQuery } from './types/card.type';

@Controller('card')
@ApiTags('Card')
@ApiBearerAuth()
export class CardController {
  constructor(private activityService: CardService) {}

  @Get()
  async getCards(@Query() query: CardQuery): Promise<Card[]> {
    return await this.activityService.getCards(query.search);
  }
}
