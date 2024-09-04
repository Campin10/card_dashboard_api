import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Stripe from 'stripe';
import { IActivity } from '../activity/types/activity.type';
import {
  ActivityEvents,
  ActivityEventsDocument,
} from '../database/mongodb/activityEvents';
import {
  CardMetrics,
  CardMetricsDocument,
} from '../database/mongodb/cardMetrics';
import { StripeIntegration } from '../integrations/stripe/stripe.service';

import {
  Identifiable,
  IMetrics,
  IMetricsTransactions,
  TypeListParams,
} from './types/metrics.type';

@Injectable()
export class MetricsService {
  constructor(
    @InjectModel(CardMetrics.name)
    private cardMetricsModel: Model<CardMetricsDocument>,
    @InjectModel(ActivityEvents.name)
    private activityEventsModel: Model<ActivityEventsDocument>,
    @Inject(StripeIntegration)
    private readonly stripeIntegration: StripeIntegration,
  ) {}
  private getTransactionsMetricsAndAnalysis(
    transactions: Stripe.Issuing.Transaction[],
  ) {
    let totalAmountSpent = 0;
    const transactionsGroupedByCategory: Record<string, number> = {};

    transactions.forEach((transaction) => {
      totalAmountSpent += transaction.amount;
      const category = transaction.merchant_data.category || 'Unknown';
      transactionsGroupedByCategory[category] =
        (transactionsGroupedByCategory[category] || 0) + 1;
    });

    return { totalAmountSpent, transactionsGroupedByCategory };
  }

  private async fetchAll<T extends Identifiable>(
    fetchFunction: (params: TypeListParams) => Promise<Stripe.ApiList<T>>,
    params: TypeListParams,
  ): Promise<T[]> {
    let hasMore = true;
    let startingAfter: string | null = null;
    const results: T[] = [];

    while (hasMore) {
      const response = await fetchFunction({
        ...params,
        ...(startingAfter ? { starting_after: startingAfter } : {}),
      });

      results.push(...response.data);
      hasMore = response.has_more;

      if (hasMore && response.data.length > 0) {
        startingAfter = response.data[response.data.length - 1].id;
      }
    }

    return results;
  }

  private async getAllAuthorizationsByCard(
    cardId: string,
    limitByActivityType: number,
  ): Promise<Stripe.Issuing.Authorization[]> {
    return this.fetchAll(
      (params) => this.stripeIntegration.getAuthorizations(params),
      { card: cardId, limit: limitByActivityType, status: 'closed' },
    );
  }

  private async getAllTransactionsByCardWithMetrics(
    cardId: string,
    limitByActivityType: number,
  ): Promise<IMetricsTransactions> {
    const transactionsList = await this.fetchAll(
      (params) => this.stripeIntegration.getTransactions(params),
      { card: cardId, limit: limitByActivityType, type: 'capture' },
    );

    const { totalAmountSpent, transactionsGroupedByCategory } =
      this.getTransactionsMetricsAndAnalysis(transactionsList);
    const numberOfTransactions = transactionsList.length;

    await this.cardMetricsModel.findOneAndUpdate(
      { id: cardId },
      { totalAmountSpent, transactionsGroupedByCategory, numberOfTransactions },
      { upsert: true },
    );

    return {
      metrics: {
        totalAmountSpent,
        averageTransactionAmount: totalAmountSpent / numberOfTransactions,
        transactionsGroupedByCategory,
        numberOfTransactions,
      },
      transactionsList,
    };
  }
  private mapActivities(
    transactionsList: Stripe.Issuing.Transaction[],
    authorizationsList: Stripe.Issuing.Authorization[],
    cardId: string,
  ): IActivity[] {
    const activityList = [...transactionsList, ...authorizationsList];

    return activityList.map((item) => ({
      cardId,
      amount: item.amount,
      category: item.merchant_data.category || 'Unknown',
      created: item.created,
      state: 'approved' in item ? item.approved : undefined,
    }));
  }

  async getMetrics(cardId: string): Promise<IMetrics> {
    try {
      const cardMetrics = await this.cardMetricsModel
        .findOne({ id: cardId })
        .exec();

      if (cardMetrics) {
        return {
          totalAmountSpent: cardMetrics.totalAmountSpent,
          transactionsGroupedByCategory:
            cardMetrics.transactionsGroupedByCategory,
          numberOfTransactions: cardMetrics.numberOfTransactions,
          averageTransactionAmount:
            cardMetrics.totalAmountSpent / cardMetrics.numberOfTransactions,
        };
      }

      const [transactionsResult, authorizationsResult] = await Promise.all([
        this.getAllTransactionsByCardWithMetrics(cardId, 100),
        this.getAllAuthorizationsByCard(cardId, 100),
      ]);

      const activityList = this.mapActivities(
        transactionsResult['transactionsList'],
        authorizationsResult,
        cardId,
      );

      await this.activityEventsModel.insertMany(activityList);

      return transactionsResult.metrics;
    } catch (error) {
      console.error('Error fetching metrics:', error);
      throw new InternalServerErrorException('Failed to retrieve metrics');
    }
  }
}
