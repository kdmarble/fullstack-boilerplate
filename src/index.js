import "dotenv/config";
import cors from "cors";
import express from "express";
import jwt from "jsonwebtoken";
import { ApolloServer, AuthenticationError } from "apollo-server-express";

import schema from "./schema";
import resolvers from "./resolvers";
import db, { sequelize } from "./models";

const app = express();
app.use(cors());

// Used to verify the token sent via http header
const getMe = async req => {
  const token = req.headers["x-token"];

  if (token) {
    try {
      return await jwt.verify(token, process.env.SECRET);
    } catch (e) {
      throw new AuthenticationError("Your session expired. Sign in again");
    }
  }
};

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  formatError: error => {
    const message = error.message
      .replace("SequelizeValidationError: ", "")
      .replace("Validation error: ", "");

    return {
      ...error,
      message
    };
  },
  context: async ({ req, connection }) => {
    if (connection) {
      return { db };
    }
    if (req) {
      const me = await getMe(req);
      return {
        db,
        me,
        secret: process.env.SECRET
      };
    }
  }
});

server.applyMiddleware({
  app,
  path: "/graphql"
});

// Used to seed DB w/ sample data on start
const eraseDatabaseOnSync = true;

sequelize.sync({ force: eraseDatabaseOnSync }).then(async () => {
  if (eraseDatabaseOnSync) {
    createUsersWithMessages();
  }

  app.listen({ port: 8000 }, () => {
    console.log("Apollo Server on http://localhost:8000/graphql");
  });
});

// Used to seed DB w/ sample data on start
const createUsersWithMessages = async () => {
  await db.user.create(
    {
      username: "keith",
      email: "hello@keith.com",
      password: "testtest",
      role: "ADMIN",
      messages: [
        {
          text: "Message one"
        }
      ]
    },
    {
      include: [db.message]
    }
  );

  await db.user.create(
    {
      username: "Marble",
      email: "hello@marble.com",
      password: "testtest",
      messages: [
        {
          text: "message two"
        },
        {
          text: "Hello world"
        }
      ]
    },
    {
      include: [db.message]
    }
  );
};
