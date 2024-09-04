import Stripe from 'stripe';

export class StripeIntegration {
  private static instance: StripeIntegration;
  private stripe: Stripe;

  private constructor() {
    if (!process.env.STRIPE_KEY) {
      throw new Error('STRIPE_KEY is not defined in environment variables');
    }
    this.stripe = new Stripe(process.env.STRIPE_KEY);
  }

  public static getInstance(): StripeIntegration {
    if (!StripeIntegration.instance) {
      StripeIntegration.instance = new StripeIntegration();
    }
    return StripeIntegration.instance;
  }

  async getTransactions(params: Stripe.Issuing.TransactionListParams) {
    try {
      return await this.stripe.issuing.transactions.list(params);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  async getAuthorizations(params: Stripe.Issuing.AuthorizationListParams) {
    try {
      return await this.stripe.issuing.authorizations.list(params);
    } catch (error) {
      console.error('Error fetching authorizations:', error);
      throw error;
    }
  }

  async getCards(params: Stripe.Issuing.CardListParams) {
    try {
      return await this.stripe.issuing.cards.list(params);
    } catch (error) {
      console.error('Error fetching cards:', error);
      throw error;
    }
  }
}
