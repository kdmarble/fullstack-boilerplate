import { ForbiddenError } from "apollo-server";
import { combineResolvers, skip } from "graphql-resolvers";

// Acts as middleware, skip = next, checks if user is logged in
export const isAuthenticated = (parent, args, { me }) => {
  me ? skip : new ForbiddenError("Not authenticated as user.");
};

// Checks if user has admin role or not
export const isAdmin = combineResolvers(
  isAuthenticated,
  (parent, args, { me: { role } }) => {
    role === "ADMIN" ? skip : new ForbiddenError("Not authorized as admin");
  }
);

// Checks if user is the owner of the message
export const isMessageOwner = async (parent, { id }, { db, me }) => {
  const message = await db.message.findByPk(id, { raw: true });

  if (message.userId !== me.id) {
    throw new ForbiddenError("Not authenticated as owner");
  }

  return skip;
};
