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
      try {
        return await db.message.create({
          text,
          userId: me.id
        });
      } catch (error) {
        throw new Error("Error creating message");
      }
    },

    deleteMessage: async (parent, { id }, { db }) => {
      try {
        return await db.message.destroy({ where: { id } });
      } catch (error) {
        throw new Error("Error deleting message");
      }
    },

    updateMessage: async (parent, { id, text }, { db }) => {
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
  },

  Message: {
    user: async (message, args, { db }) => {
      return await db.user.findByPk(message.userId);
    }
  }
};
