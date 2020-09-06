export default {
  Query: {
    messages: async (parent, args, { db }) => {
      return await db.message.findAll();
    },
    message: async (parent, { id }, { db }) => {
      return await db.message.findByPk(id);
    }
  },

  Mutation: {
    createMessage: async (parent, { text }, { me, db }) => {
      return await db.message.create({
        text,
        userId: me.id
      });
    },

    deleteMessage: async (parent, { id }, { db }) => {
      return await db.message.destroy({ where: { id } });
    },

    updateMessage: async (parent, { id, text }, { db }) => {
      return await db.message.update(
        { text: text },
        {
          where: {
            userId: id
          }
        }
      );
    }
  },

  Message: {
    user: async (message, args, { db }) => {
      return await db.user.findByPk(message.userId);
    }
  }
};
