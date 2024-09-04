import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ActivityEvents,
  ActivityEventsDocument,
} from '../database/mongodb/activityEvents';
import { IActivityResponse } from './types/activity.type';

@Injectable()
export class ActivityService {
  constructor(
    @InjectModel(ActivityEvents.name)
    private activityEventsModel: Model<ActivityEventsDocument>,
  ) {}

  async getActivity(
    cardId: string,
    skip: number,
    limit: number,
  ): Promise<IActivityResponse> {
    try {
      const [items, count] = await Promise.all([
        this.activityEventsModel
          .find({ cardId })
          .skip(skip)
          .limit(limit)
          .sort([['created', 'desc']])
          .exec(),
        this.activityEventsModel.countDocuments({ cardId }).exec(),
      ]);

      return {
        items,
        pagination: {
          skip: Number(skip),
          limit: Number(limit),
          total: count,
          moreAvailable: Number(skip) + Number(limit) < count,
        },
      };
    } catch (error) {
      console.error('Error fetching activity:', error);
      throw new InternalServerErrorException(
        'Failed to retrieve activity data',
      );
    }
  }
}
