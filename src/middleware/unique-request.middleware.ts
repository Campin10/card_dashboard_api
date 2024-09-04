import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response } from 'express';
import { v4 as uuid } from 'uuid';

/*
    Add Unique uuid to each http request. It is used to track commands triggered by
    a user.
*/
@Injectable()
export class UniqueRequestIdMiddleware implements NestMiddleware {
  use(req: { uuid: string }, _res: Response, next: () => void) {
    req.uuid = uuid();
    next();
  }
}
