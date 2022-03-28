import { Kind, GraphQLError, ValueNode } from 'graphql';
import { ObjectId as _ObjectId } from 'bson';
import { schemaComposer } from 'graphql-compose';
import { GraphQLScalarTypeConfig } from 'graphql-compose/lib/graphql';
import { Directive, Extensions } from 'graphql-compose/lib/utils/definitions';

export const ObjectId = schemaComposer.createScalarTC({
  name: 'ObjectID',
  description:
    'A field whose value conforms with the standard mongodb object ID as described here: https://docs.mongodb.com/manual/reference/method/ObjectId/#ObjectId. Example: 5e5677d71bdc2ae76344968c',
  serialize(value: _ObjectId): string {
    if (!_ObjectId.isValid(value)) {
      throw new TypeError(`Value is not a valid mongodb object id of form: ${value}`);
    }
    return value.toHexString();
  },
  parseValue(value: string): _ObjectId {
    if (!_ObjectId.isValid(value)) {
      throw new TypeError(`Value is not a valid mongodb object id of form: ${value}`);
    }
    return new _ObjectId(value);
  },
  parseLiteral(ast: ValueNode): _ObjectId {
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError(
        `Can only validate strings as mongodb object id but got a: ${ast.kind}`
      );
    }

    if (!_ObjectId.isValid(ast.value)) {
      throw new TypeError(`Value is not a valid mongodb object id of form: ${ast.value}`);
    }

    return new _ObjectId(ast.value);
  },
} as GraphQLScalarTypeConfig<_ObjectId, string> & {
  extensions?: Extensions;
  directives?: Directive[];
});
