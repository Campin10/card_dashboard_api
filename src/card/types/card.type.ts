import { IsString, MaxLength } from 'class-validator';

export interface Card {
  id: string;
  last4: string;
  brand: string;
}

export class CardQuery {
  @IsString()
  @MaxLength(4)
  search: string;
}
