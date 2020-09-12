import jwt from "jsonwebtoken";
import { combineResolvers } from "graphql-resolvers";
import {
  UserInputError,
  AuthenticationError,
  PubSub,
  withFilter
} from "apollo-server";
import { isAdmin } from "./authorization";
import pubsub, { EVENTS } from "../subscription";

const createToken = async (user, secret, expiresIn) => {
  const { id, email, username, role } = user;
  return await jwt.sign({ id, email, username, role }, secret, {
    expiresIn
  });
};

export default {
  Query: {
    users: async (parent, args, { db }) => {
      return await db.user.findAll();
    },
    user: async (parent, { id }, { db }) => {
      return await db.user.findByPk(id);
    },
    me: async (parent, args, { db, me }) => {
      if (!me) {
        return null;
      }
      return await db.user.findByPk(me.id);
    }
  },

  Mutation: {
    signUp: async (parent, { username, email, password }, { db, secret }) => {
      const user = await db.user.create({
        username,
        email,
        password
      });

      pubsub.publish(EVENTS.USER.CREATED, {
        newUser: {
          user
        }
      });

      return { token: createToken(user, secret, "30m") };
    },
    signIn: async (parent, { login, password }, { db, secret }) => {
      const user = await db.user.findByLogin(login);

      if (!user) {
        throw new UserInputError("No user found with these login credentials");
      }

      const isValid = await user.validatePassword(password);

      if (!isValid) {
        throw new AuthenticationError("Invalid password");
      }

      return { token: createToken(user, secret, "30m") };
    },
    deleteUser: combineResolvers(isAdmin, async (parent, { id }, { db }) => {
      const user = await db.user.findByPk(id);
      const userDeleted = await db.user.destroy({
        where: { id }
      });

      pubsub.publish(EVENTS.USER.DELETED, {
        userDeleted: {
          user
        }
      });

      return userDeleted;
    }),
    userTyping: async (parent, { senderMail, receiverMail }, { db }) => {
      pubsub.publish(EVENTS.USER.TYPING, {
        userTyping: {
          senderMail,
          receiverMail
        }
      });
      return true;
    }
  },

  User: {
    messages: async (user, args, { db }) => {
      return await db.message.findAll({
        where: {
          userId: user.id
        }
      });
    }
  },

  Subscription: {
    userTyping: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(EVENTS.USER.TYPING),
        (payload, variables) => {
          return payload.receiverMail === variables.receiverMail;
        }
      )
    },
    newUser: {
      subscribe: () => pubsub.asyncIterator(EVENTS.USER.CREATED)
    },
    userDeleted: {
      subscribe: () => pubsub.asyncIterator(EVENTS.USER.DELETED)
    }
  }
};
