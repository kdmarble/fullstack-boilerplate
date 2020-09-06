export const user = (sequelize, DataTypes) => {
  // Define table named user, with a column named
  // username that's type string
  const User = sequelize.define("user", {
    username: {
      type: DataTypes.STRING
    }
  });

  // User has many messages
  User.associate = models => {
    User.hasMany(models.Message, { onDelete: "CASCADE" });
  };

  return User;
};
