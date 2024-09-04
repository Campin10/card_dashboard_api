import { Module } from '@nestjs/common';
import { StripeIntegration } from './stripe.service';

@Module({
  providers: [
    {
      provide: StripeIntegration,
      useFactory: () => StripeIntegration.getInstance(),
    },
  ],
  exports: [StripeIntegration],
})
export class StripeModule {}
