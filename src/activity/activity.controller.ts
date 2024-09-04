import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ActivityService } from './activity.service';
import { ActivityQuery, IActivityResponse } from './types/activity.type';

@Controller('activity')
@ApiTags('Activity')
@ApiBearerAuth()
export class ActivityController {
  constructor(private activityService: ActivityService) {}

  @Get('/:uuid')
  async getActivity(
    @Param('uuid') uuid: string,
    @Query() query: ActivityQuery,
  ): Promise<IActivityResponse> {
    return await this.activityService.getActivity(
      uuid,
      query.skip,
      query.limit,
    );
  }
}
