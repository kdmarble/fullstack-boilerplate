import "dotenv/config";
import Sequelize from "sequelize";
import path from "path";
import fs from "fs";

const basename = path.basename(__filename);

const db = {};

const sequelize = new Sequelize(
  process.env.DATABASE,
  process.env.DATABASE_USER,
  process.env.DATABASE_PASSWORD,
  {
    dialect: "postgres",
    logging: false
  }
);

// Reads the contents of the directory
fs.readdirSync(path.join(__dirname))
  // Filters to get appropriately named js files
  .filter(
    file =>
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
  )
  // For each file, associate each model with the exports of each file
  // Append to db object
  .forEach(file => {
    const model = require(path.join(__dirname, file)).default(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

// Associate each model with each other and expose to application
Object.keys(db).forEach(key => {
  if (db[key].associate) {
    db[key].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export { sequelize };
export default db;
