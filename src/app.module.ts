import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityController } from './activity/activity.controller';
import { ActivityService } from './activity/activity.service';
import { CardController } from './card/card.controller';
import { CardService } from './card/card.service';
import {
  ActivityEvents,
  ActivityEventsSchema,
} from './database/mongodb/activityEvents';
import { CardMetrics, CardMetricsSchema } from './database/mongodb/cardMetrics';
import { StripeIntegration } from './integrations/stripe/stripe.service';
import { MetricsController } from './metrics/metrics.controller';
import { MetricsService } from './metrics/metrics.service';
import { UniqueRequestIdMiddleware } from './middleware/unique-request.middleware';
import { WebHookController } from './webhook/webhook.controller';
import { WebhookService } from './webhook/webhook.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_CONNECTION),
    MongooseModule.forFeature([
      {
        name: CardMetrics.name,
        schema: CardMetricsSchema,
      },
      {
        name: ActivityEvents.name,
        schema: ActivityEventsSchema,
      },
    ]),
  ],
  controllers: [
    ActivityController,
    MetricsController,
    WebHookController,
    CardController,
  ],
  providers: [
    ActivityService,
    MetricsService,
    WebhookService,
    CardService,
    {
      provide: StripeIntegration,
      useFactory: () => StripeIntegration.getInstance(),
    },
  ],
})
export class AppModule {
  onModuleInit() {}

  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(UniqueRequestIdMiddleware).forRoutes('*');
  }
}
