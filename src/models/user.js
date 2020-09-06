const user = (sequelize, DataTypes) => {
  // Define table named user, with a column named
  // username that's type string
  const User = sequelize.define("user", {
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: "Username cannot be empty"
        }
      }
    }
  });

  // User has many messages
  User.associate = models => {
    User.hasMany(models.message, { onDelete: "CASCADE" });
  };

  User.findByLogin = async login => {
    let user = await User.findOne({
      where: { username: login }
    });

    if (!user) {
      user = await User.findOne({
        where: { email: login }
      });
    }

    return user;
  };

  return User;
};

export default user;
