import { Request, Response } from 'express';
import { User } from '..';

type Ctx = {
  req: Request;
  res: Response & { user?: User };
};

export default Ctx;
