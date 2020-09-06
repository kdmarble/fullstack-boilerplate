const message = (sequelize, DataTypes) => {
  // Define message table with column names message
  // that's type string
  const Message = sequelize.define("message", {
    text: {
      type: DataTypes.STRING
    }
  });

  // Each message belongs to a user
  Message.associate = models => {
    Message.belongsTo(models.user);
  };

  return Message;
};

export default message;
