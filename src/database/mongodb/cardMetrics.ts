import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CardMetricsDocument = HydratedDocument<CardMetrics>;

interface ITransactionsGroupedByCategory {
  [key: string]: number;
}

@Schema()
export class CardMetrics {
  @Prop()
  id: string;

  @Prop()
  totalAmountSpent: number;

  @Prop({ type: Object })
  transactionsGroupedByCategory: ITransactionsGroupedByCategory;

  @Prop()
  numberOfTransactions: number;
}

export const CardMetricsSchema = SchemaFactory.createForClass(CardMetrics);
