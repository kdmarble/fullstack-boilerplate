const message = (sequelize, DataTypes) => {
  // Define message table with column names message
  // that's type string
  const Message = sequelize.define("message", {
    text: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          args: true,
          msg: "A message must have a text"
        }
      }
    }
  });

  // Each message belongs to a user
  Message.associate = models => {
    Message.belongsTo(models.user);
  };

  return Message;
};

export default message;
