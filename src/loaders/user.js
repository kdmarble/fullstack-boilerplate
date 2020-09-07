// Batch load users
export const batchUsers = async (keys, db) => {
  const users = await db.user.findAll({
    where: {
      id: {
        $in: keys
      }
    }
  });

  return keys.map(key => users.find(user => user.id === key));
};
