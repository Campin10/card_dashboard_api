import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Request, Response } from 'express';
import { Model } from 'mongoose';
import Stripe from 'stripe';
import {
  ActivityEvents,
  ActivityEventsDocument,
} from '../database/mongodb/activityEvents';
import {
  CardMetrics,
  CardMetricsDocument,
} from '../database/mongodb/cardMetrics';

@Injectable()
export class WebhookService {
  constructor(
    @InjectModel(CardMetrics.name)
    private cardMetricsModel: Model<CardMetricsDocument>,
    @InjectModel(ActivityEvents.name)
    private activityEventsModel: Model<ActivityEventsDocument>,
  ) {}

  private async createNewActivityRecord(
    amount: number,
    category: string,
    cardId: string,
    created: number,
    state: boolean = false,
  ) {
    try {
      const cardMetrics = await this.cardMetricsModel
        .findOne({ id: cardId })
        .exec();

      if (!cardMetrics) {
        console.warn(`No card metrics found for cardId ${cardId}`);
        return;
      }

      const transactionsGroupedByCategory = {
        ...cardMetrics.transactionsGroupedByCategory,
        [category]:
          (cardMetrics.transactionsGroupedByCategory[category] || 0) + 1,
      };

      await this.cardMetricsModel.updateOne(
        { id: cardId },
        {
          numberOfTransactions: cardMetrics.numberOfTransactions + 1,
          totalAmountSpent: cardMetrics.totalAmountSpent + amount,
          transactionsGroupedByCategory,
        },
      );

      const activityEventsModel = new this.activityEventsModel({
        amount,
        category,
        cardId,
        created: created,
        state,
      });

      await activityEventsModel.save();
    } catch (error) {
      console.error('Error creating new activity record', error.stack);
    }
  }
  async processNewEvent(req: Request, res: Response): Promise<void> {
    let event: Stripe.Event = req.body;

    try {
      switch (event.type) {
        case 'issuing_transaction.created':
          this.createNewActivityRecord(
            event.data.object.amount,
            event.data.object.merchant_data.category,
            event.data.object.card as string,
            event.data.object.created,
          );
          break;

        case 'issuing_authorization.created':
          this.createNewActivityRecord(
            event.data.object.amount,
            event.data.object.merchant_data.category,
            event.data.object.card.id,
            event.data.object.created,
            event.data.object.approved,
          );
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.status(HttpStatus.OK).json({ received: true });
    } catch (error) {
      console.error('Error processing event', error.stack);
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: 'Failed to process event' });
    }
  }
}
