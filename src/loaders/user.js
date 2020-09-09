import Sequelize from "sequelize";

// Batch load users
export const batchUsers = async (keys, db) => {
  const users = await db.user.findAll({
    where: {
      id: {
        [Sequelize.Op.in]: keys
      }
    }
  });

  return keys.map(key => users.find(user => user.id === key));
};
