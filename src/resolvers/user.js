export default {
  Query: {
    users: async (parent, args, { db }) => {
      return await db.user.findAll();
    },
    user: async (parent, { id }, { db }) => {
      return await db.user.findByPk(id);
    },
    me: async (parent, args, { db, me }) => {
      return await db.user.findByPk(me.id);
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
  }
};
