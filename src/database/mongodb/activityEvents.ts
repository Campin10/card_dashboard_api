import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ActivityEventsDocument = HydratedDocument<ActivityEvents>;

@Schema()
export class ActivityEvents {
  @Prop()
  cardId: string;

  @Prop()
  amount: number;

  @Prop()
  category: string;

  @Prop()
  state: boolean;

  @Prop()
  created: number;
}

export const ActivityEventsSchema =
  SchemaFactory.createForClass(ActivityEvents);
