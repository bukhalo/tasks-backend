import { schemaComposer } from '../../../schema-composer';
import { DateTimeResolver } from 'graphql-scalars';

export const DateTime = schemaComposer.createScalarTC({
  name: DateTimeResolver.name,
  description: DateTimeResolver.description,
  serialize: DateTimeResolver.serialize,
  parseValue: DateTimeResolver.parseValue,
  parseLiteral: DateTimeResolver.parseLiteral,
});
