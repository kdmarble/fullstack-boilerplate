import "dotenv/config";
import cors from "cors";
import express from "express";
import jwt from "jsonwebtoken";
import http from "http";
import DataLoader from "dataloader";
import { ApolloServer, AuthenticationError } from "apollo-server-express";

import schema from "./schema";
import resolvers from "./resolvers";
import db, { sequelize } from "./models";
import loaders from "./loaders";

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
  introspection: true,
  playground: true,
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
      return {
        db,
        loaders: {
          user: new DataLoader(keys => loaders.user.batchUsers(keys, db))
        }
      };
    }
    if (req) {
      const me = await getMe(req);
      return {
        db,
        me,
        secret: process.env.SECRET,
        loaders: {
          user: new DataLoader(keys => loaders.user.batchUsers(keys, db))
        }
      };
    }
  }
});

server.applyMiddleware({
  app,
  path: "/graphql"
});

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

// Used to seed DB w/ sample data on start
// const isTest = !!process.env.TEST_DATABASE;
// const isProduction = !!process.env.DATABASE_URL;
const port = process.env.PORT || 8000;

sequelize.sync().then(async () => {
  // if (isTest || isProduction) {
  //   createUsersWithMessages(new Date());
  // }

  httpServer.listen({ port }, () => {
    console.log("Apollo Server on http://localhost:8000/graphql");
  });
});

// Used to seed DB w/ sample data on start
// const createUsersWithMessages = async date => {
//   await db.user.create(
//     {
//       username: "keith",
//       email: "hello@keith.com",
//       password: "testtest",
//       role: "ADMIN",
//       messages: [
//         {
//           text: "Message one",
//           createdAt: date.setSeconds(date.getSeconds() + 1)
//         }
//       ]
//     },
//     {
//       include: [db.message]
//     }
//   );

//   await db.user.create(
//     {
//       username: "Marble",
//       email: "hello@marble.com",
//       password: "testtest",
//       role: "USER",
//       messages: [
//         {
//           text: "message two",
//           createdAt: date.setSeconds(date.getSeconds() + 1)
//         },
//         {
//           text: "Hello world",
//           createdAt: date.setSeconds(date.getSeconds() + 1)
//         }
//       ]
//     },
//     {
//       include: [db.message]
//     }
//   );
// };
