import { schemaComposer } from '../schema-composer';
import { Username, UserPassword } from '../users';
import jwt from 'jsonwebtoken';
import argon2 from 'argon2';

const AccessToken = schemaComposer.createScalarTC({
  name: 'AccessToken',
});

const AuthLoginInput = schemaComposer.createInputTC({
  name: 'AuthLoginInput',
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

const AuthLoginPayload = schemaComposer.createObjectTC({
  name: 'AuthLoginPayload',
  fields: {
    accessToken: AccessToken.NonNull,
    query: 'Query',
  },
});

schemaComposer.Mutation.addNestedFields({
  'auth.login': {
    type: AuthLoginPayload.NonNull,
    args: {
      input: {
        type: AuthLoginInput.NonNull,
      },
    },
    resolve: async (s, { input }, { usersCollection }) => {
      const user = await usersCollection.findOne({ username: input.username });

      if (!user) {
        return null;
      }

      const isPasswordValid = await argon2.verify(user.password, input.password);

      if (isPasswordValid) {
        const jwtSign = jwt.sign(
          {
            id: user._id,
            role: user.role,
          },
          process.env.JWT_SECRET!
        );

        return {
          accessToken: jwtSign,
          query: {},
        };
      }
    },
  },
});
