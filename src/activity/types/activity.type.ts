import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';
import { IPagination } from '../../types/general.type';

export interface IActivity {
  cardId: string;
  amount: number;
  category: string;
  transactions?: number;
  created: number;
}

export interface IActivityResponse {
  items: IActivity[];
  pagination: IPagination;
}

export class ActivityQuery {
  @IsInt()
  @Type(() => Number)
  @Min(0)
  skip: number;
  @IsInt()
  @Type(() => Number)
  @Min(10)
  limit: number;
}
