import { SchemaComposer } from 'graphql-compose';
import { GraphQLContext } from './common/interfaces/graphql-context';

export const schemaComposer = new SchemaComposer<GraphQLContext>();
