import { gql } from "apollo-server-express";

export default gql`
  extend type Query {
    users: [User!]
    user(id: ID!): User
    me: User
  }

  extend type Mutation {
    signUp(username: String!, email: String!, password: String!): Token!
    signIn(login: String!, password: String!): Token!
    deleteUser(id: ID!): Boolean!
    userTyping(email: String!, receiverMail: String!): Boolean!
  }

  type Token {
    token: String!
  }

  type User {
    id: ID!
    username: String!
    email: String!
    role: String
    messages: [Message!]
  }

  extend type Subscription {
    userTyping(receiverMail: String!): String
    newUser: NewUser!
    userDeleted: UserDeleted!
  }

  type NewUser {
    user: User!
  }

  type UserDeleted {
    user: User!
  }
`;
