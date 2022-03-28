import argon2 from 'argon2';
import { schemaComposer } from '../schema-composer';
import { ObjectId } from '../common/graphql/scalars/object-id';
import { DateTime } from '../common/graphql/scalars/date-time';

export const UserId = ObjectId.clone('UserID');

export const Username = schemaComposer.createScalarTC({
  name: 'Username',
});

export const UserPassword = schemaComposer.createScalarTC({
  name: 'UserPassword',
});

const UserRole = schemaComposer.createEnumTC({
  name: 'UserRole',
  values: {
    ADMIN: {
      description: 'Admin role',
      value: 'ADMIN',
    },
    USER: {
      description: 'Standard user role',
      value: 'USER',
    },
  },
});

const User = schemaComposer.createObjectTC({
  name: 'User',
  fields: {
    id: {
      type: UserId.NonNull,
      resolve: s => s._id,
    },
    username: {
      description: 'User username',
      type: Username.NonNull,
    },
    role: {
      description: 'User role',
      type: UserRole.NonNull,
    },
    createdAt: {
      description: 'User created at',
      type: DateTime.NonNull,
    },
    updatedAt: {
      description: 'User updated at',
      type: DateTime.NonNull,
    },
  },
});

const UserRegistrationInput = schemaComposer.createInputTC({
  name: 'UserRegistrationInput',
  fields: {
    username: {
      description: 'User username',
      type: Username.NonNull,
    },
    password: {
      description: 'User password',
      type: UserPassword.NonNull,
    },
  },
});

const UserRegistrationPayload = schemaComposer.createObjectTC({
  name: 'UserRegistrationPayload',
  fields: {
    record: User,
    recordId: UserId,
    query: 'Query',
  },
});

schemaComposer.Query.addFields({
  user: {
    type: User.NonNull,
    args: {
      id: {
        description: 'User ID',
        type: UserId.NonNull,
      },
    },
    resolve: async (s, { id }, { user, usersCollection }) => {
      if (!user || user.role !== 'ADMIN') return null;
      return usersCollection.findOne({ _id: id });
    },
  },
  userCollection: {
    type: User.NonNull.List,
    resolve: async (s, a, { user, usersCollection }) => {
      if (!user || user.role !== 'ADMIN') return null;
      return usersCollection.find().toArray();
    },
  },
});

schemaComposer.Mutation.addNestedFields({
  'users.registration': {
    type: UserRegistrationPayload,
    args: {
      input: UserRegistrationInput.NonNull,
    },
    resolve: async (s, { input }, { usersCollection }) => {
      const { password, ...document } = input;
      const usersCounter = await usersCollection.countDocuments();

      const passwordHash = await argon2.hash(password);

      const userInsertResponse = await usersCollection.insertOne({
        ...document,
        password: passwordHash,
        role: usersCounter === 0 ? 'ADMIN' : 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const userCreated = await usersCollection.findOne({ _id: userInsertResponse.insertedId });

      if (userCreated) {
        return {
          record: userCreated,
          recordId: userCreated._id,
          query: {},
        };
      }
    },
  },
});
