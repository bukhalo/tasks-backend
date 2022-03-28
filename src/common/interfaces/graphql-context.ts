import { Request, Response } from 'express';
import { Collection, ObjectId } from 'mongodb';
import { User } from './user';
import { Task } from './task';

interface ContextUser {
  id: ObjectId;
  role: string;
}

export interface GraphQLContext {
  req: Request;
  res: Response;
  user?: ContextUser;
  usersCollection: Collection<User>;
  tasksCollection: Collection<Task>;
}
