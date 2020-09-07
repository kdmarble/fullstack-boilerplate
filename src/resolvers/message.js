import { combineResolvers } from "graphql-resolvers";
import { isAuthenticated, isMessageOwner } from "./authorization";

export default {
  Query: {
    messages: async (parent, { cursor, limit = 100 }, { db }) => {
      return await db.message.findAll({
        order: [["createdAt", "DESC"]],
        limit,
        where: cursor
          ? {
              createdAt: {
                [Sequelize.Op.lt]: cursor
              }
            }
          : null
      });
    },
    message: async (parent, { id }, { db }) => {
      return await db.message.findByPk(id);
    }
  },

  Mutation: {
    createMessage: combineResolvers(
      isAuthenticated,
      async (parent, { text }, { me, db }) => {
        try {
          return await db.message.create({
            text,
            userId: me.id
          });
        } catch (error) {
          throw new Error("Error creating message");
        }
      }
    ),

    deleteMessage: combineResolvers(
      isAuthenticated,
      isMessageOwner,
      async (parent, { id }, { db }) => {
        try {
          return await db.message.destroy({ where: { id } });
        } catch (error) {
          throw new Error("Error deleting message");
        }
      }
    ),

    updateMessage: combineResolvers(
      isAuthenticated,
      isMessageOwner,
      async (parent, { id, text }, { db }) => {
        try {
          return await db.message.update(
            { text: text },
            {
              where: {
                userId: id
              }
            }
          );
        } catch (error) {
          throw new Error("Error updating message");
        }
      }
    )
  },

  Message: {
    user: async (message, args, { db }) => {
      return await db.user.findByPk(message.userId);
    }
  }
};
