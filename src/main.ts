import 'dotenv/config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageDisabled,
} from 'apollo-server-core';
import { schemaComposer } from './schema-composer';
import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import { GraphQLContext } from './common/interfaces/graphql-context';
import { User } from './common/interfaces/user';
import { Task } from './common/interfaces/task';

require('./auth');
require('./users');
require('./tasks');

const main = async (): Promise<void> => {
  const app = express();
  const mongoClient = new MongoClient(process.env.MONGODB_URI!);
  const apolloServer = new ApolloServer({
    schema: schemaComposer.buildSchema(),
    plugins: [
      process.env.NODE_ENV === 'production'
        ? ApolloServerPluginLandingPageDisabled()
        : ApolloServerPluginLandingPageGraphQLPlayground(),
    ],
    context: ({ req, res }): GraphQLContext => {
      const token = req.headers.authorization || '';

      let user = null;

      if (token) {
        const tokenPayload = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET!);
        user = {
          // @ts-ignore
          id: new ObjectId(tokenPayload.id),
          // @ts-ignore
          role: tokenPayload.role,
        };
      }

      const db = mongoClient.db('main');
      const usersCollection = db.collection<User>('users');
      const tasksCollection = db.collection<Task>('tasks');
      return {
        req,
        res,
        // @ts-ignore
        user,
        usersCollection,
        tasksCollection,
      };
    },
  });

  await mongoClient.connect();
  await apolloServer.start();
  apolloServer.applyMiddleware({ app });
  app.listen({ port: 4000 });
  console.log('GraphQL Playground: http://localhost:4000');
};

main();
