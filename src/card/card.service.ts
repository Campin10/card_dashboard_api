import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import Stripe from 'stripe';
import { StripeIntegration } from '../integrations/stripe/stripe.service';
import { Card } from './types/card.type';

@Injectable()
export class CardService {
  constructor(
    @Inject(StripeIntegration)
    private readonly stripeIntegration: StripeIntegration,
  ) {}

  private mapCardToCardType(card: Stripe.Issuing.Card): Card {
    return {
      id: card.id,
      last4: card.last4,
      brand: card.brand,
    };
  }

  async getCards(search?: string): Promise<Card[]> {
    try {
      const { data: cards } = await this.stripeIntegration.getCards({
        limit: 10,
        ...(search ? { last4: search } : {}),
        status: 'active',
      });

      return cards.map(this.mapCardToCardType);
    } catch (error) {
      console.error('Error fetching cards from Stripe:', error);
      throw new InternalServerErrorException('Failed to fetch cards');
    }
  }
}
